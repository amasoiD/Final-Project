// === 1. Canvas 監控圖表 (視覺特效) ===
const canvas = document.getElementById('trafficChart');
const ctx = canvas.getContext('2d');
let chartData = [];
const maxDataPoints = 50;
let lastDrawTime = 0;
const REFRESH_RATE = 1000;

// 初始化 Canvas 大小
function resizeCanvas() {
    const panel = document.querySelector('.monitor-panel');
    if(panel) {
        canvas.width = panel.offsetWidth;
        canvas.height = 150; 
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 產生隨機數據並繪圖 (模擬 CPU 波動)
function drawChart(timestamp) {
    requestAnimationFrame(drawChart);

    if (!lastDrawTime) lastDrawTime = timestamp;
    const elapsed = timestamp - lastDrawTime;

    if (elapsed < REFRESH_RATE) {
        return; 
    }
    lastDrawTime = timestamp;

    let lastValue = chartData.length > 0 ? chartData[chartData.length - 1] : 50;
    let variance = Math.floor(Math.random() * 20) - 10;
    let newData = lastValue + variance;
    
    if (newData > 90) newData = 90;
    if (newData < 10) newData = 10;
    
    chartData.push(newData);
    if (chartData.length > maxDataPoints) {chartData.shift();}

    const newLatency = Math.floor(Math.random() * 40) + 20; 
    const latencySpan = document.getElementById('latencyValue');
    
    if (latencySpan) {
        latencySpan.innerText = `${newLatency}ms`;
        if (newLatency > 50) {
            latencySpan.style.color = '#ff6b6b';
        } else {
            latencySpan.style.color = '#fff';
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    
    const stepX = canvas.width / (maxDataPoints - 1);

    chartData.forEach((val, index) => {
        const x = index * stepX;
        const y = canvas.height - (val / 100 * canvas.height);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    
    ctx.stroke();

    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
}
requestAnimationFrame(drawChart);


// === 2. 終端機模擬 (Terminal Simulation) ===
const terminalBody = document.getElementById('consoleOutput');

function logToTerminal(text, type = 'info') {
    const line = document.createElement('div');
    line.className = 'line';
    
    // 取得現在時間
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    line.innerHTML = `<span style="color:#666">[${time}]</span> ${text}`;
    
    if (type === 'error') line.style.color = '#ff6b6b';
    if (type === 'success') line.style.color = '#51cf66';
    
    terminalBody.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

// 模擬打字執行效果
function simulateExecution(commands) {
    let delay = 0;
    
    commands.forEach((cmd) => {
        delay += Math.random() * 800 + 500; // 隨機延遲 0.5~1.3秒
        setTimeout(() => {
            logToTerminal(`> ${cmd}`, 'info');
        }, delay);
    });

    setTimeout(() => {
        logToTerminal("Execution completed successfully.", 'success');
    }, delay + 1000);
}


// === 3. 頁面切換邏輯 ===
function switchTab(tabName) {
    const workspace = document.getElementById('workspace');
    const allTabs = document.querySelectorAll('.sidebar li');
    allTabs.forEach(tab => tab.classList.remove('active'));
    const targetTab = document.querySelector(`.sidebar li[data-tab="${tabName}"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    workspace.innerHTML = ''; 

    if (tabName === 'overview') {
    workspace.innerHTML = `
        <h2>系統概況 (System Overview)</h2>
        <div class="overview-panel">
            <p><strong>連線狀態:</strong> <span style="color:green">● 穩定 (Stable)</span></p>
            <p><strong>目前專案:</strong> My-Minecraft-Server-2025</p>
            <p><strong>運行時間:</strong> 12 Days, 4 Hours</p>
            <hr style="margin:15px 0; border:0; border-top:1px solid #ccc;">
            <p>歡迎使用 GCP VPS 優化助手。請從左側選單選擇功能開始操作。</p>
        </div>
    `;
    logToTerminal("View changed to: System Overview", "info");
}
    else if (tabName === 'calculator') {
        renderCalculator();
        logToTerminal("Module loaded: Cost Calculator", "info");
    } 
    else if (tabName === 'generator') {
        renderGenerator();
        logToTerminal("Module loaded: Script Generator", "info");
    }
}

// === 4. 渲染計算機介面 (DOM 生成) ===
function renderCalculator() {
    const workspace = document.getElementById('workspace');
    workspace.innerHTML = ''; 

    // --- 標題 ---
    const title = document.createElement('h2');
    title.innerText = "GCP 雲端成本試算 (Cost Calculator)";
    workspace.appendChild(title);

    // --- 容器：用 flex 讓選單排整齊 ---
    const formRow = document.createElement('div');
    formRow.style.display = 'flex';
    formRow.style.alignItems = 'center';
    formRow.style.gap = '15px';
    formRow.style.marginBottom = '20px';
    formRow.style.flexWrap = 'wrap';

    // 1. 區域選擇
    const regionLabel = document.createElement('label');
    regionLabel.innerText = "選擇區域 (Region):";
    
    const selectRegion = document.createElement('select');
    selectRegion.id = 'regionSelect';
    
    // 填入區域選項
    for (let regionKey in GCP_PRICING) {
        let opt = document.createElement('option');
        opt.value = regionKey;
        opt.text = GCP_PRICING[regionKey].regionName;
        selectRegion.appendChild(opt);
    }

    // 2. 機型選擇 (Instance Select) - 這就是原本漏掉的！
    const instanceLabel = document.createElement('label');
    instanceLabel.innerText = "選擇機型 (Instance):";
    
    const selectInstance = document.createElement('select');
    selectInstance.id = 'instanceSelect';

    // 3. 連動邏輯：定義一個更新機型選單的函式
    function updateInstanceList() {
        // 清空舊選項
        selectInstance.innerHTML = '';
        
        const selectedRegion = selectRegion.value;
        const instances = GCP_PRICING[selectedRegion].instances;

        // 遍歷該區域下的所有機型
        for (let type in instances) {
            const data = instances[type];
            let opt = document.createElement('option');
            opt.value = type;
            // 顯示文字：機型名稱 + 規格 + 價格
            opt.text = `${type} (${data.vCPU} vCPU, ${data.ram}GB RAM) - $${data.price}/hr`;
            selectInstance.appendChild(opt);
        }
    }

    // 綁定事件：當區域改變時，重跑一次更新函式
    selectRegion.onchange = updateInstanceList;
    
    // 初始化：先執行一次，不然一進來機型選單會是空的
    updateInstanceList();

    // 將元素加入容器
    formRow.appendChild(regionLabel);
    formRow.appendChild(selectRegion);
    formRow.appendChild(instanceLabel);
    formRow.appendChild(selectInstance);
    
    workspace.appendChild(formRow);


    // --- 額外增加行數：硬碟大小輸入框 ---
    const storageRow = document.createElement('div');
    storageRow.style.marginBottom = '20px';
    storageRow.innerHTML = `
        <label>硬碟大小 (GB): </label>
        <input type="number" id="storageSize" value="30" min="10" style="width:80px;">
        <span style="font-size:0.9em; color:#666;">(標準硬碟費率)</span>
    `;
    workspace.appendChild(storageRow);


    // --- 計算按鈕 ---
    const btn = document.createElement('button');
    btn.innerText = "計算每月預估費用";
    btn.className = "submit";
    btn.style.marginTop = "10px";
    
    btn.onclick = () => {
        // 1. 取得使用者輸入
        const region = document.getElementById('regionSelect').value;
        const instanceType = document.getElementById('instanceSelect').value;
        const storageGB = parseInt(document.getElementById('storageSize').value) || 0;

        // 2. 取得價格數據 (從 data.js)
        const regionData = GCP_PRICING[region];
        const instanceData = regionData.instances[instanceType];
        
        // 假設硬碟每 GB $0.04
        const storagePricePerGB = 0.04; 

        // 3. 計算邏輯
        const instanceMonthly = instanceData.price * 24 * 30; // 機器月費
        const storageMonthly = storageGB * storagePricePerGB; // 硬碟月費
        const total = (instanceMonthly + storageMonthly).toFixed(2);

        // 4. 顯示結果 (模擬終端機運算)
        logToTerminal(`Analyzing pricing for ${instanceType} in ${region}...`);
        
        const originalText = btn.innerText;
        btn.innerText = "計算中...";
        btn.disabled = true;

        setTimeout(() => {
            logToTerminal(`Instance Cost: $${instanceMonthly.toFixed(2)}`, 'info');
            logToTerminal(`Storage Cost: $${storageMonthly.toFixed(2)}`, 'info');
            logToTerminal(`Total Estimated: $${total} USD / Month`, 'success');
            
            btn.innerText = originalText;
            btn.disabled = false;

            showCalculationResult(total, regionData.regionName, instanceType);
        }, 800);
    };

    workspace.appendChild(btn);
}

function showCalculationResult(totalPrice, regionName, instanceType) {
    const oldRes = document.getElementById('calcResult');
    if(oldRes) oldRes.remove();

    const resultDiv = document.createElement('div');
    resultDiv.id = 'calcResult';
    resultDiv.style.marginTop = "30px";
    resultDiv.style.padding = "20px";
    resultDiv.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    resultDiv.style.color = "white";
    resultDiv.style.borderRadius = "10px";
    resultDiv.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
    resultDiv.style.animation = "fadeIn 0.5s";

    resultDiv.innerHTML = `
        <h3 style="margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.3); padding-bottom:5px;">預估報價單 (Estimation)</h3>
        <div style="display:flex; justify-content:space-between; font-size:1.2em;">
            <span>地區: ${regionName}</span>
            <span>機型: ${instanceType}</span>
        </div>
        <div style="margin-top:20px; text-align:right;">
            <span style="font-size:1rem;">總計 (Total):</span>
            <span style="font-size:2.5rem; font-weight:bold; margin-left:10px;">$${totalPrice}</span>
            <span style="font-size:1rem;"> USD/mo</span>
        </div>
    `;

    document.getElementById('workspace').appendChild(resultDiv);
}

// === 5. 腳本生成器邏輯 (核心功能) ===
function renderGenerator() {
    const workspace = document.getElementById('workspace');
    
    // 標題
    const title = document.createElement('h2');
    title.innerText = "VPS 優化腳本生成器 (Config Generator)";
    workspace.appendChild(title);

    // 建立表單容器
    const formContainer = document.createElement('div');
    formContainer.style.display = 'flex';
    formContainer.style.flexDirection = 'column';
    formContainer.style.gap = '15px';
    
    // --- 區塊 A: 系統基礎設定 ---
    const section1 = createSection("1. 系統環境配置 (System Config)");
    
    // 選項: Swap 大小
    const swapWrapper = document.createElement('div');
    swapWrapper.innerHTML = `
        <label>虛擬記憶體 (Swap): </label>
        <select id="swapSize">
            <option value="0">不設定</option>
            <option value="1">1 GB (推薦 Micro 實例)</option>
            <option value="2" selected>2 GB (標準)</option>
            <option value="4">4 GB (大型應用)</option>
        </select>
    `;
    section1.appendChild(swapWrapper);

    // 核取方塊: BBR 加速
    const bbrCheck = createCheckbox("enableBBR", "開啟 TCP BBR 擁塞控制 (網速優化)", true);
    section1.appendChild(bbrCheck);
    
    // 核取方塊: 更新系統
    const updateCheck = createCheckbox("systemUpdate", "執行 apt-get update & upgrade", true);
    section1.appendChild(updateCheck);

    formContainer.appendChild(section1);


    // --- 區塊 B: 應用服務部署 ---
    const section2 = createSection("2. 應用服務部署 (Deploy Services)");

    // 選單: 選擇要部署的服務
    const serviceSelect = document.createElement('div');
    serviceSelect.innerHTML = `
        <label>選擇服務類型: </label>
        <select id="serviceType" onchange="toggleServiceOptions()">
            <option value="none">僅系統優化 (不部署服務)</option>
            <option value="minecraft">Minecraft Java Server</option>
            <option value="web">Nginx Web Server</option>
            <option value="docker">Docker Environment Only</option>
        </select>
    `;
    section2.appendChild(serviceSelect);

    // Minecraft 專用選項 (預設隱藏)
    const mcOptions = document.createElement('div');
    mcOptions.id = "mcOptions";
    mcOptions.style.display = "none";
    mcOptions.style.marginTop = "10px";
    mcOptions.style.padding = "10px";
    mcOptions.style.borderLeft = "3px solid #e0c3fc";
    mcOptions.style.background = "rgba(255,255,255,0.5)";
    
    mcOptions.innerHTML = `
        <div style="margin-bottom:5px;">
            <label>伺服器版本: </label>
            <input type="text" id="mcVersion" value="1.20.1" style="width:80px;">
        </div>
        <div>
            <label>分配記憶體: </label>
            <input type="text" id="mcRam" value="2G" style="width:80px;">
        </div>
    `;
    section2.appendChild(mcOptions);

    formContainer.appendChild(section2);


    // --- 產生按鈕 ---
    const actionBtn = document.createElement('button');
    actionBtn.className = "submit";
    actionBtn.innerText = "生成優化腳本 (Generate Script)";
    actionBtn.onclick = generateScriptLogic;
    
    formContainer.appendChild(actionBtn);
    workspace.appendChild(formContainer);
}

// 輔助函式: 建立區塊容器
function createSection(titleText) {
    const box = document.createElement('div');
    box.style.border = "1px solid rgba(0,0,0,0.1)";
    box.style.padding = "15px";
    box.style.borderRadius = "8px";
    box.style.background = "rgba(255,255,255,0.3)";
    
    const h4 = document.createElement('h4');
    h4.innerText = titleText;
    h4.style.marginBottom = "10px";
    h4.style.color = "#555";
    box.appendChild(h4);
    return box;
}

// 輔助函式: 建立 Checkbox
function createCheckbox(id, labelText, isChecked) {
    const wrapper = document.createElement('div');
    const box = document.createElement('input');
    box.type = "checkbox";
    box.id = id;
    box.checked = isChecked;
    
    const label = document.createElement('label');
    label.innerText = " " + labelText;
    label.htmlFor = id;
    
    wrapper.appendChild(box);
    wrapper.appendChild(label);
    return wrapper;
}

// 互動函式: 切換 Minecraft 選項顯示/隱藏
function toggleServiceOptions() {
    const type = document.getElementById('serviceType').value;
    const mcDiv = document.getElementById('mcOptions');
    
    if (type === 'minecraft') {
        mcDiv.style.display = "block";
        // 增加一點互動特效
        logToTerminal("Selected Service: Minecraft Server. Loading templates...", "info");
    } else {
        mcDiv.style.display = "none";
    }
}

// === 6. 最終邏輯: 組合字串並輸出到 Terminal ===
function generateScriptLogic() {
    logToTerminal("Starting config generation process...", "info");
    
    const swapSize = document.getElementById('swapSize').value;
    const enableBBR = document.getElementById('enableBBR').checked;
    const doUpdate = document.getElementById('systemUpdate').checked;
    const serviceType = document.getElementById('serviceType').value;

    let finalScript = "#!/bin/bash\n# GCP VPS Auto-Config Script\n\n";

    // 1. 系統更新
    if (doUpdate) {
        finalScript += SCRIPT_TEMPLATES.basic_update + "\n";
    }

    // 2. Swap 設定
    if (swapSize !== "0") {
        finalScript += SCRIPT_TEMPLATES.swap_config(swapSize) + "\n";
    }

    // 3. BBR 設定
    if (enableBBR) {
        finalScript += `
echo ">> Enabling TCP BBR..."
echo "net.core.default_qdisc=fq" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
        \n`;
    }

    // 4. 服務部署
    if (serviceType === 'minecraft') {
        const ver = document.getElementById('mcVersion').value;
        const ram = document.getElementById('mcRam').value;
        if (SCRIPT_TEMPLATES.minecraft_docker) {
             finalScript += SCRIPT_TEMPLATES.minecraft_docker(ver, ram) + "\n";
        }
    } else if (serviceType === 'docker') {
        finalScript += `
echo ">> Installing Docker Environment..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
        \n`;
    }

    finalScript += `echo ">> Optimization Complete! Enjoy your server."`;

    setTimeout(() => {
        logToTerminal("Analyzing hardware dependencies...", "info");
    }, 400);

    setTimeout(() => {
        logToTerminal("Building shell script...", "info");
        
        const lines = finalScript.split('\n');
        simulateExecution(["Generating file: optimize.sh", ...lines.slice(0, 3), "... (content truncated)"]);
        
        showResultArea(finalScript);
        
    }, 1500);
}

// 顯示結果的文字區域
function showResultArea(content) {
    const workspace = document.getElementById('workspace');
    
    const oldResult = document.getElementById('resultArea');
    if (oldResult) oldResult.remove();

    const resultBox = document.createElement('div');
    resultBox.id = 'resultArea';
    resultBox.style.marginTop = "20px";
    resultBox.style.animation = "fadeIn 1s";

    const textArea = document.createElement('textarea');
    textArea.value = content;
    textArea.style.width = "100%";
    textArea.style.height = "200px";
    textArea.style.background = "#222";
    textArea.style.color = "#50fa7b";
    textArea.style.padding = "10px";
    textArea.style.borderRadius = "5px";
    textArea.style.fontFamily = "monospace";
    
    const copyBtn = document.createElement('button');
    copyBtn.innerText = "複製腳本 (Copy Code)";
    copyBtn.className = "submit";
    copyBtn.style.marginTop = "10px";
    copyBtn.onclick = () => {
        textArea.select();
        document.execCommand('copy');
        alert("腳本已複製！請連線至您的 GCP 主機並貼上執行。");
        logToTerminal("Script copied to clipboard.", "success");
    };

    resultBox.appendChild(document.createElement('h3')).innerText = "生成的腳本 (Generated Script):";
    resultBox.appendChild(textArea);
    resultBox.appendChild(copyBtn);
    
    workspace.appendChild(resultBox);
    
    resultBox.scrollIntoView({ behavior: 'smooth' });
}

// === 7. 系統權限管理 (Auth & Logout) ===
function logout() {
    // 1. 互動回饋
    const workspace = document.getElementById('workspace');
    workspace.style.opacity = '0.5';
    workspace.style.pointerEvents = 'none';
    
    logToTerminal("User initiated logout sequence...", "info");
    logToTerminal("Saving session state...", "info");

    // 2. 模擬網路延遲，增加真實感
    setTimeout(() => {
        // 3. 清除 localStorage 中的登入憑證
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        
        logToTerminal("Session terminated. Redirecting...", "success");
        
        // 4. 跳轉回登入頁
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
        
    }, 1000);
}

// === 8. 頁面載入時的初始化檢查 ===
(function checkAuth() {
    const isLogged = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');

    if (isLogged !== 'true') {
        alert("尚未登入！請由登入頁面進入系統。");
        window.location.href = 'index.html';
        return;
    }
    // === 已登入，開始模擬連線載入流程 (Loading Sequence) ===
    logToTerminal(`System initialized. Welcome back, ${currentUser}.`, 'success');
    
    setTimeout(() => {
        logToTerminal(`Connecting to GCP Region: asia-east1 (Taiwan)...`, 'info');
    }, 1000);

    setTimeout(() => {
        logToTerminal(`Retrieving instance metadata... [OK]`, 'info');
        logToTerminal(`Loading user preferences... [OK]`, 'info');
    }, 2000);

    setTimeout(() => {
        switchTab('overview');
        logToTerminal(`Dashboard GUI loaded successfully.`, 'success');
        
        const workspace = document.getElementById('workspace');
        workspace.style.animation = "fadeIn 1s"; 
    }, 3000);
})();