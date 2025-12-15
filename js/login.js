const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMsg = document.getElementById('errorMsg');

// 設定正確的測試帳號 (模擬後端資料)
const VALID_USER = {
    user: 'admin',
    pass: 'Mohican66'
};

// 功能 1: 處理表單提交
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userVal = usernameInput.value.trim();
    const passVal = passwordInput.value.trim();
    
    // 清除錯誤訊息
    errorMsg.innerText = '';

    // 簡單的驗證邏輯
    if (userVal === '') {
        showError('請輸入使用者名稱');
        return;
    }
    
    // 模擬網路延遲 (Loading 效果) - 增加真實感與程式碼行數
    const submitBtn = document.querySelector('.submit');
    const originalText = submitBtn.value;
    submitBtn.value = "驗證中...";
    submitBtn.disabled = true;
    submitBtn.style.cursor = "not-allowed";

    setTimeout(() => {
        // 驗證帳密
        if (userVal === VALID_USER.user && passVal === VALID_USER.pass) {
            // 儲存登入狀態 (用 localStorage 模擬 Session)
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', userVal);
            
            // 跳轉到主畫面
            window.location.href = 'dashboard.html'; 
        } else {
            // 登入失敗
            showError('帳號或密碼錯誤，請重試！');
            shakeModal(); // 呼叫震動特效
            
            // 復原按鈕
            submitBtn.value = originalText;
            submitBtn.disabled = false;
            submitBtn.style.cursor = "pointer";
        }
    }, 800); // 延遲 0.8 秒
});

// 功能 2: 顯示錯誤訊息
function showError(msg) {
    errorMsg.innerText = msg;
}

// 功能 3: 錯誤時的震動特效
function shakeModal() {
    const box = document.querySelector('.box');
    box.style.animation = "shake 0.5s";
    
    setTimeout(() => {
        box.style.animation = "none";
    }, 500);
}
