const GCP_PRICING = {
    "asia-east1": {
        regionName: "Asia East (Taiwan)",
        baseCost: 0.002,
        instances: {
            "e2-micro": { vCPU: 2, ram: 1, price: 0.009 },
            "e2-small": { vCPU: 2, ram: 2, price: 0.018 },
            "e2-medium": { vCPU: 2, ram: 4, price: 0.038 },
            "e2-standard-2": { vCPU: 2, ram: 8, price: 0.078 },
            "e2-standard-4": { vCPU: 4, ram: 16, price: 0.155 },
            "e2-standard-8": { vCPU: 8, ram: 32, price: 0.310 },
            "e2-standard-16": { vCPU: 16, ram: 64, price: 0.621 },
            "e2-standard-32": { vCPU: 32, ram: 128, price: 1.241 },
            "e2-highmem-2": { vCPU: 2, ram: 16, price: 0.105 },
            "e2-highmem-4": { vCPU: 4, ram: 32, price: 0.209 },
            "e2-highmem-8": { vCPU: 8, ram: 64, price: 0.419 },
            "e2-highmem-16": { vCPU: 16, ram: 128, price: 0.837 },
            "e2-highcpu-2": { vCPU: 2, ram: 2, price: 0.057 },
            "e2-highcpu-4": { vCPU: 4, ram: 4, price: 0.115 },
            "e2-highcpu-8": { vCPU: 8, ram: 8, price: 0.229 },
            "e2-highcpu-16": { vCPU: 16, ram: 16, price: 0.458 },
            "e2-highcpu-32": { vCPU: 32, ram: 32, price: 0.916 },
        }
    }
};

// 腳本生成模板 (使用 Template Literals)
const SCRIPT_TEMPLATES = {
    // 基礎系統更新
    basic_update: `
echo ">> Updating System Repositories..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl wget unzip git
    `,

    swap_config: (sizeGB) => `
echo ">> Configuring Swap Space (${sizeGB}GB)..."
# Check if swap exists
if [ -f /swapfile ]; then
    echo "Swap file already exists. Skipping."
else
    sudo fallocate -l ${sizeGB}G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap created successfully."
fi
    `,

    // Minecraft Docker 啟動指令
    minecraft_docker: (version, ram) => `
echo ">> Deploying Minecraft Server (${version})..."
# Install Docker if not exists
if ! [ -x "$(command -v docker)" ]; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
fi

# Run Container
docker run -d -it --name mc-server \\
    -e EULA=TRUE \\
    -e VERSION=${version} \\
    -e MEMORY=${ram} \\
    -p 25565:25565 \\
    itzg/minecraft-server
echo ">> Minecraft Server is starting on port 25565!"
    `
};