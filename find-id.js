// EDUVER Find ID Logic with PocketBase integration

document.addEventListener("DOMContentLoaded", () => {
    const findForm = document.getElementById("find-id-form");
    const nameInput = document.getElementById("find-name");
    const birthdateInput = document.getElementById("find-birthdate");
    const submitBtn = document.getElementById("find-submit-btn");
    const resultBox = document.getElementById("result-box");
    const foundIdContainer = document.getElementById("found-id-container");

    const POCKETBASE_URL = "https://pb.joyfamkr.synology.me";

    // Utility for showing/hiding feedback
    const showFeedback = (inputEl, errorId, isValid) => {
        const errorEl = document.getElementById(errorId);
        if (isValid) {
            inputEl.parentElement.style.borderColor = "";
            if (errorEl) errorEl.style.display = "none";
        } else {
            inputEl.parentElement.style.borderColor = "var(--accent-red)";
            if (errorEl) errorEl.style.display = "flex";
        }
    };

    // Live validation event listeners
    nameInput.addEventListener("input", () => {
        const isValid = nameInput.value.trim().length > 0;
        showFeedback(nameInput, "error-find-name", isValid);
    });

    birthdateInput.addEventListener("change", () => {
        const isValid = birthdateInput.value !== "";
        showFeedback(birthdateInput, "error-find-birthdate", isValid);
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
        }, 3000);
    };

    // Form Submit Handler
    findForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nameVal = nameInput.value.trim();
        const birthdateVal = birthdateInput.value;

        const isNameValid = nameVal.length > 0;
        const isBirthdateValid = birthdateVal !== "";

        showFeedback(nameInput, "error-find-name", isNameValid);
        showFeedback(birthdateInput, "error-find-birthdate", isBirthdateValid);

        if (!isNameValid || !isBirthdateValid) {
            showToast("이름과 생년월일을 모두 입력해주세요.", true);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> 조회 중...';

        try {
            // Filter users collection by name and birthdate
            // Handles date format variations if necessary
            const filterQuery = `name='${nameVal}' && birthdate~'${birthdateVal}'`;
            const encodedFilter = encodeURIComponent(filterQuery);
            const response = await fetch(`${POCKETBASE_URL}/api/collections/users/records?filter=(${encodedFilter})`);

            if (response.ok) {
                const data = await response.json();
                const matchedUsers = data.items || [];

                if (matchedUsers.length > 0) {
                    foundIdContainer.innerHTML = "";
                    matchedUsers.forEach(user => {
                        let createdStr = "";
                        if (user.created) {
                            try {
                                const d = new Date(user.created.replace(" ", "T"));
                                createdStr = `가입일: ${d.getFullYear()}.${String(d.getMonth()+1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
                            } catch(e) {}
                        }

                        const card = document.createElement("div");
                        card.className = "result-id-card";
                        card.innerHTML = `
                            <div style="text-align: left;">
                                <div class="found-id-text">${user.username}</div>
                                <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">${user.email || user.username + '@eduver.com'}</div>
                            </div>
                            <div class="found-created-text">${createdStr}</div>
                        `;
                        foundIdContainer.appendChild(card);
                    });

                    // Hide form and show result
                    findForm.style.display = "none";
                    resultBox.style.display = "block";
                    showToast("아이디를 성공적으로 조회했습니다.");
                } else {
                    showToast("일치하는 회원 정보가 없습니다. 이름과 생년월일을 확인해주세요.", true);
                    submitBtn.disabled = false;
                    submitBtn.textContent = "아이디 찾기";
                }
            } else {
                console.error("PocketBase query error:", await response.text());
                showToast("회원 정보 조회에 실패했습니다. 다시 시도해주세요.", true);
                submitBtn.disabled = false;
                submitBtn.textContent = "아이디 찾기";
            }
        } catch (error) {
            console.error("Connection error:", error);
            showToast("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.", true);
            submitBtn.disabled = false;
            submitBtn.textContent = "아이디 찾기";
        }
    });
});
