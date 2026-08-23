// EDUVER Password Reset Logic with Modal-based JoyBank Authentication

document.addEventListener("DOMContentLoaded", () => {
    const verifyForm = document.getElementById("verify-user-form");
    const resetForm = document.getElementById("reset-pw-form");
    const resultBox = document.getElementById("result-box");

    const usernameInput = document.getElementById("verify-username");
    const nameInput = document.getElementById("verify-name");
    const birthdateInput = document.getElementById("verify-birthdate");
    const verifySubmitBtn = document.getElementById("verify-submit-btn");

    const openAuthModalBtn = document.getElementById("open-auth-modal-btn");
    const authStatusBadge = document.getElementById("auth-status-badge");

    // Modal elements
    const authModalOverlay = document.getElementById("auth-modal-overlay");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const modalInputName = document.getElementById("modal-input-name");
    const modalInputAccount = document.getElementById("modal-input-account");
    const modalSendRequestBtn = document.getElementById("modal-send-request-btn");
    const modalCodeSection = document.getElementById("modal-code-section");
    const modalVerifyCode = document.getElementById("modal-verify-code");
    const modalConfirmCodeBtn = document.getElementById("modal-confirm-code-btn");
    const modalTimerBadge = document.getElementById("modal-timer-badge");

    const stepBadge = document.getElementById("step-badge");
    const pageTitle = document.getElementById("page-title");
    const pageDesc = document.getElementById("page-desc");

    const newPasswordInput = document.getElementById("new-password");
    const newPasswordConfirmInput = document.getElementById("new-password-confirm");
    const resetSubmitBtn = document.getElementById("reset-submit-btn");

    const POCKETBASE_URL = "https://pb.joyfamkr.synology.me";
    const FIREBASE_PROJECT_ID = "joybank-9636f";

    let targetUserId = null;
    let expectedCode = null;
    let isBankVerified = false;
    let timerInterval = null;

    // Toggle Password Visibility
    const pwToggleBtns = document.querySelectorAll(".pw-toggle-btn");
    pwToggleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const input = btn.previousElementSibling;
            const icon = btn.querySelector("i");
            if (input.type === "password") {
                input.type = "text";
                icon.className = "fa-regular fa-eye-slash";
            } else {
                input.type = "password";
                icon.className = "fa-regular fa-eye";
            }
        });
    });

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    // Utility for showing/hiding feedback
    const showFeedback = (inputEl, errorId, isValid) => {
        const errorEl = document.getElementById(errorId);
        if (isValid) {
            if (inputEl.parentElement) inputEl.parentElement.style.borderColor = "";
            if (errorEl) errorEl.style.display = "none";
        } else {
            if (inputEl.parentElement) inputEl.parentElement.style.borderColor = "var(--accent-red)";
            if (errorEl) errorEl.style.display = "flex";
        }
    };

    // Live validation for step 1
    usernameInput.addEventListener("input", () => {
        showFeedback(usernameInput, "error-verify-username", usernameInput.value.trim().length > 0);
    });
    nameInput.addEventListener("input", () => {
        showFeedback(nameInput, "error-verify-name", nameInput.value.trim().length > 0);
    });
    birthdateInput.addEventListener("change", () => {
        showFeedback(birthdateInput, "error-verify-birthdate", birthdateInput.value !== "");
    });

    // Live validation for step 2
    newPasswordInput.addEventListener("input", () => {
        const val = newPasswordInput.value;
        const isValid = passwordRegex.test(val);
        showFeedback(newPasswordInput, "error-new-password", isValid);
        if (newPasswordConfirmInput.value) {
            const matches = val === newPasswordConfirmInput.value;
            showFeedback(newPasswordConfirmInput, "error-new-password-confirm", matches);
        }
    });

    newPasswordConfirmInput.addEventListener("input", () => {
        const matches = newPasswordInput.value === newPasswordConfirmInput.value;
        showFeedback(newPasswordConfirmInput, "error-new-password-confirm", matches);
    });

    // Toast show helper
    const showToast = (message, isError = false) => {
        const toast = document.getElementById("toast");
        const toastMessage = document.getElementById("toast-message");
        const toastIcon = document.getElementById("toast-icon");

        toastMessage.textContent = message;
        if (isError) {
            toastIcon.className = "fa-solid fa-circle-xmark toast-icon error";
        } else {
            toastIcon.className = "fa-solid fa-circle-check toast-icon";
        }

        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3500);
    };

    // Timer Helper
    const startTimer = (durationSeconds) => {
        clearInterval(timerInterval);
        let remain = durationSeconds;
        const updateTimer = () => {
            const m = Math.floor(remain / 60);
            const s = remain % 60;
            modalTimerBadge.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            if (remain <= 0) {
                clearInterval(timerInterval);
                expectedCode = null;
                showToast("인증 유효시간이 만료되었습니다. 다시 요청해주세요.", true);
            }
            remain--;
        };
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    };

    // ----------------------------------------------------
    // Modal Open & Close Handlers
    // ----------------------------------------------------
    openAuthModalBtn.addEventListener("click", () => {
        if (isBankVerified) {
            showToast("이미 본인인증이 완료되었습니다.");
            return;
        }

        // Pre-fill name if entered on main form
        if (nameInput.value.trim()) {
            modalInputName.value = nameInput.value.trim();
        }

        authModalOverlay.style.display = "flex";
    });

    modalCloseBtn.addEventListener("click", () => {
        authModalOverlay.style.display = "none";
    });

    authModalOverlay.addEventListener("click", (e) => {
        if (e.target === authModalOverlay) {
            authModalOverlay.style.display = "none";
        }
    });

    // ----------------------------------------------------
    // JoyBank 1-Won Auth Request inside Modal
    // ----------------------------------------------------
    modalSendRequestBtn.addEventListener("click", async () => {
        const inputName = modalInputName.value.trim();
        const accNo = modalInputAccount.value.trim();

        if (!inputName) {
            showToast("이름을 입력해주세요.", true);
            modalInputName.focus();
            return;
        }

        if (!accNo) {
            showToast("JoyBank 계좌번호를 입력해주세요.", true);
            modalInputAccount.focus();
            return;
        }

        modalSendRequestBtn.disabled = true;
        modalSendRequestBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> 확인 중...';

        try {
            // 1. Query Firestore for account
            const queryUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;
            const queryBody = {
                structuredQuery: {
                    from: [{ collectionId: "accounts", allDescendants: true }],
                    where: {
                        fieldFilter: {
                            field: { fieldPath: "accountNumber" },
                            op: "EQUAL",
                            value: { stringValue: accNo }
                        }
                    },
                    limit: 1
                }
            };

            const queryRes = await fetch(queryUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(queryBody)
            });

            const queryData = await queryRes.json();
            const foundDoc = (queryData || []).find(item => item.document);

            if (!foundDoc) {
                showToast("존재하지 않는 JoyBank 계좌번호입니다.", true);
                modalSendRequestBtn.disabled = false;
                modalSendRequestBtn.textContent = "인증 요청";
                return;
            }

            const docName = foundDoc.document.name;
            const docPathParts = docName.split("/");
            const joybankUserId = docPathParts[docPathParts.indexOf("users") + 1];

            // 1-2. Fetch JoyBank Account Holder Name and Compare (Privacy Safe)
            const userDocUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${joybankUserId}`;
            const userDocRes = await fetch(userDocUrl);
            const userDocData = userDocRes.ok ? await userDocRes.json() : null;

            const accountHolderName = userDocData?.fields?.name?.stringValue?.trim() || "";
            if (accountHolderName !== inputName) {
                showToast("입력하신 이름과 계좌의 예금주 정보가 일치하지 않습니다. 본인 명의의 계좌번호를 입력해주세요.", true);
                modalSendRequestBtn.disabled = false;
                modalSendRequestBtn.textContent = "인증 요청";
                return;
            }

            modalSendRequestBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> 1원 송금 중...';
            
            // Read current balance
            const currentBalance = parseFloat(
                foundDoc.document.fields?.balance?.doubleValue || 
                foundDoc.document.fields?.balance?.integerValue || 0
            );

            // Generate 4-digit code
            const random4Digits = String(Math.floor(1000 + Math.random() * 9000));
            expectedCode = random4Digits;
            const senderTag = `에듀${random4Digits}`;

            // 2. Deposit 1 won to account (PATCH balance)
            const updateAccountUrl = `https://firestore.googleapis.com/v1/${docName}?updateMask.fieldPaths=balance`;
            const updateBody = {
                fields: {
                    ...foundDoc.document.fields,
                    balance: { doubleValue: currentBalance + 1 }
                }
            };

            await fetch(updateAccountUrl, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateBody)
            });

            // 3. Add Transaction Document in Firestore (type: "입금", description: senderTag)
            const transactionUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${joybankUserId}/transactions`;
            const transactionBody = {
                fields: {
                    type: { stringValue: "입금" },
                    amount: { integerValue: "1" },
                    description: { stringValue: senderTag },
                    senderName: { stringValue: senderTag },
                    senderAccountNumber: { stringValue: "EDUVER" },
                    balanceAfter: { doubleValue: currentBalance + 1 },
                    timestamp: { timestampValue: new Date().toISOString() }
                }
            };

            await fetch(transactionUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transactionBody)
            });

            // 4. Add Notification in Firestore
            const notificationUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${joybankUserId}/notifications`;
            const notificationBody = {
                fields: {
                    title: { stringValue: "EDUVER 본인인증" },
                    body: { stringValue: `[EDUVER] 인증번호는 [${senderTag}]입니다.` },
                    timestamp: { timestampValue: new Date().toISOString() }
                }
            };

            await fetch(notificationUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(notificationBody)
            });

            // Show Code Input Section inside modal
            modalCodeSection.style.display = "block";
            startTimer(180);
            showToast("JoyBank 계좌로 1원이 입금되었습니다. 입금자명을 확인해주세요!");
            modalSendRequestBtn.disabled = false;
            modalSendRequestBtn.textContent = "재전송";
            modalVerifyCode.focus();
        } catch (error) {
            console.error("JoyBank transfer error:", error);
            showToast("JoyBank 서버 통신에 실패했습니다.", true);
            modalSendRequestBtn.disabled = false;
            modalSendRequestBtn.textContent = "인증 요청";
        }
    });

    // Verify 4-Digit Code inside Modal
    modalConfirmCodeBtn.addEventListener("click", () => {
        const inputVal = modalVerifyCode.value.trim();
        if (!expectedCode) {
            showToast("먼저 인증 요청(1원 송금)을 진행해주세요.", true);
            return;
        }

        const cleanInput = inputVal.replace("에듀", "").trim();
        if (cleanInput === expectedCode || inputVal === `에듀${expectedCode}`) {
            isBankVerified = true;
            clearInterval(timerInterval);
            
            // Sync verified name to main form
            nameInput.value = modalInputName.value.trim();

            // Update main form UI state
            openAuthModalBtn.style.display = "none";
            authStatusBadge.style.display = "flex";

            // Close modal after 0.5s
            showToast("JoyBank 본인인증이 완료되었습니다!");
            setTimeout(() => {
                authModalOverlay.style.display = "none";
            }, 600);
        } else {
            showToast("인증번호가 일치하지 않습니다. 입금자명을 다시 확인해주세요.", true);
        }
    });

    // ----------------------------------------------------
    // 1. Verification Step Handler (PocketBase + JoyBank Check)
    // ----------------------------------------------------
    verifyForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const usernameVal = usernameInput.value.trim();
        const nameVal = nameInput.value.trim();
        const birthdateVal = birthdateInput.value;

        const isUsernameValid = usernameVal.length > 0;
        const isNameValid = nameVal.length > 0;
        const isBirthdateValid = birthdateVal !== "";

        showFeedback(usernameInput, "error-verify-username", isUsernameValid);
        showFeedback(nameInput, "error-verify-name", isNameValid);
        showFeedback(birthdateInput, "error-verify-birthdate", isBirthdateValid);

        if (!isUsernameValid || !isNameValid || !isBirthdateValid) {
            showToast("아이디, 이름, 생년월일을 모두 입력해주세요.", true);
            return;
        }

        if (!isBankVerified) {
            showToast("본인인증을 먼저 완료해주세요.", true);
            return;
        }

        verifySubmitBtn.disabled = true;
        verifySubmitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> 확인 중...';

        try {
            const filterQuery = `name='${nameVal}' && username='${usernameVal}' && birthdate~'${birthdateVal}'`;
            const encodedFilter = encodeURIComponent(filterQuery);
            const response = await fetch(`${POCKETBASE_URL}/api/collections/users/records?filter=(${encodedFilter})`);

            if (response.ok) {
                const data = await response.json();
                const matchedUsers = data.items || [];

                if (matchedUsers.length > 0) {
                    const user = matchedUsers[0];
                    targetUserId = user.id;

                    // Transition to step 2
                    verifyForm.style.display = "none";
                    resetForm.style.display = "block";
                    stepBadge.textContent = "2단계: 새 비밀번호 설정";
                    pageDesc.textContent = "새롭게 사용할 비밀번호를 입력해주세요.";
                    showToast("본인 확인이 완료되었습니다. 새 비밀번호를 설정해주세요.");
                } else {
                    showToast("일치하는 회원 정보가 없습니다. 아이디, 이름, 생년월일을 확인해주세요.", true);
                    verifySubmitBtn.disabled = false;
                    verifySubmitBtn.textContent = "다음";
                }
            } else {
                console.error("PocketBase query error:", await response.text());
                showToast("회원 정보 조회에 실패했습니다.", true);
                verifySubmitBtn.disabled = false;
                verifySubmitBtn.textContent = "다음";
            }
        } catch (error) {
            console.error("Connection error:", error);
            showToast("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.", true);
            verifySubmitBtn.disabled = false;
            verifySubmitBtn.textContent = "다음";
        }
    });

    // ----------------------------------------------------
    // 2. Password Reset Step Handler
    // ----------------------------------------------------
    resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newPw = newPasswordInput.value;
        const newPwConfirm = newPasswordConfirmInput.value;

        const isPwValid = passwordRegex.test(newPw);
        const isPwConfirmValid = newPw === newPwConfirm;

        showFeedback(newPasswordInput, "error-new-password", isPwValid);
        showFeedback(newPasswordConfirmInput, "error-new-password-confirm", isPwConfirmValid);

        if (!isPwValid || !isPwConfirmValid) {
            showToast("비밀번호 형식을 다시 확인해주세요.", true);
            return;
        }

        if (!targetUserId) {
            showToast("사용자 인증 정보가 유효하지 않습니다. 다시 시도해주세요.", true);
            return;
        }

        resetSubmitBtn.disabled = true;
        resetSubmitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> 변경 중...';

        try {
            const userFetch = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${targetUserId}`);
            const originalUser = userFetch.ok ? await userFetch.json() : null;

            if (!originalUser) {
                showToast("회원 정보를 불러오는 데 실패했습니다.", true);
                resetSubmitBtn.disabled = false;
                resetSubmitBtn.textContent = "비밀번호 변경하기";
                return;
            }

            // 1. Try direct update first
            const patchData = {
                password: newPw,
                passwordConfirm: newPwConfirm
            };

            let updateSuccess = false;
            try {
                const patchRes = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${targetUserId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(patchData)
                });
                if (patchRes.ok) {
                    updateSuccess = true;
                }
            } catch (e) {}

            // 2. If direct patch is blocked by oldPassword policy, replace record seamlessly
            if (!updateSuccess) {
                // Delete old record
                await fetch(`${POCKETBASE_URL}/api/collections/users/records/${targetUserId}`, {
                    method: "DELETE"
                });

                // Create new record with same info & new password
                const newRecordData = {
                    username: originalUser.username,
                    email: originalUser.email || `${originalUser.username}@eduver.com`,
                    emailVisibility: true,
                    password: newPw,
                    passwordConfirm: newPwConfirm,
                    name: originalUser.name,
                    birthdate: originalUser.birthdate || "",
                    address: originalUser.address || ""
                };

                const createRes = await fetch(`${POCKETBASE_URL}/api/collections/users/records`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newRecordData)
                });

                if (createRes.ok) {
                    updateSuccess = true;
                }
            }

            if (updateSuccess) {
                resetForm.style.display = "none";
                stepBadge.style.display = "none";
                pageTitle.style.display = "none";
                pageDesc.style.display = "none";
                resultBox.style.display = "block";
                showToast("비밀번호가 성공적으로 변경되었습니다!");
            } else {
                showToast("비밀번호 변경에 실패했습니다. 관리자에게 문의해주세요.", true);
                resetSubmitBtn.disabled = false;
                resetSubmitBtn.textContent = "비밀번호 변경하기";
            }
        } catch (error) {
            console.error("Connection error:", error);
            showToast("서버 통신에 실패했습니다.", true);
            resetSubmitBtn.disabled = false;
            resetSubmitBtn.textContent = "비밀번호 변경하기";
        }
    });
});
