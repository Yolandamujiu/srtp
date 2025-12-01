# 运动想象实时训练反馈平台

## 项目介绍
运动想象实时训练反馈平台是一个基于React+TypeScript开发的Web应用，专注于提供运动想象训练的实时反馈，包括动作分析和大脑源成像呈现功能。

## 环境配置详细指南

### 系统要求
- 操作系统：Windows 10/11、macOS 10.15+ 或 Linux (Ubuntu 18.04+, CentOS 8+)
- 处理器：Intel Core i5 或同等AMD处理器及以上
- 内存：至少8GB RAM
- 硬盘空间：至少1GB可用空间
- 网络连接：用于下载依赖包和资源

### 开发环境配置步骤

#### 1. 安装Node.js
推荐使用Node.js v16.x或v18.x版本，不建议使用最新的不稳定版本。

**Windows系统：**
1. 访问Node.js官网：https://nodejs.org/
2. 下载LTS版本的Node.js安装程序
3. 运行安装程序，按照向导指示完成安装
4. 安装过程中勾选"Add to PATH"选项

**macOS系统：**
使用Homebrew安装(推荐)：
```bash
# 如果你还没有安装Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装Node.js
brew install node@18
```

或者从官网下载安装包：https://nodejs.org/

**Linux系统(Ubuntu/Debian)：**
```bash
# 使用nvm安装(推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

验证Node.js安装：
```bash
node -v  # 应输出v18.x.x或v16.x.x
npm -v   # 应输出7.x.x或更高版本
```

#### 2. 安装pnpm
pnpm是本项目使用的包管理器，比npm和yarn更高效。

**Windows系统：**
```bash
npm install -g pnpm
```

**macOS/Linux系统：**
```bash
npm install -g pnpm
```

或者使用官方安装脚本：
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

验证pnpm安装：
```bash
pnpm -v  # 应输出7.x.x或更高版本
```

#### 3. 获取项目代码
```bash
# 克隆项目仓库
git clone [项目仓库URL]
cd [项目目录]
```

如果没有Git，可以直接下载项目压缩包并解压。

#### 4. 安装项目依赖
进入项目根目录后执行：
```bash
pnpm install
```

**依赖安装可能遇到的问题及解决方法：**

1. **网络问题**：
   - 可以尝试使用淘宝镜像：
   ```bash
   pnpm config set registry https://registry.npmmirror.com/
   ```

2. **权限问题**：
   - Windows：以管理员身份运行命令提示符
   - macOS/Linux：
   ```bash
   sudo pnpm install
   ```

3. **node-gyp相关错误**：
   - Windows：安装windows-build-tools
   ```bash
   pnpm install --global --production windows-build-tools
   ```
   - macOS：安装Xcode命令行工具
   ```bash
   xcode-select --install
   ```
   - Linux：安装构建依赖
   ```bash
   sudo apt-get install build-essential python3
   ```

#### 5. 启动开发服务器
```bash
pnpm run dev
```

成功启动后，会显示类似以下信息：
```
  VITE v4.3.9  ready in 300 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

在浏览器中访问 http://localhost:3000 即可查看应用。

#### 6. 构建生产版本
如果需要部署应用，可以构建生产版本：
```bash
pnpm run build
```

构建完成后，生成的静态文件会保存在`dist`目录下。

#### 7. 环境验证
为确保环境配置正确，可以运行：
```bash
pnpm run test
```

## 开发工具推荐
- VS Code：https://code.visualstudio.com/
- 推荐插件：
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - React Developer Tools

## 常见问题解答

### Q: 启动开发服务器后无法访问页面怎么办？
A: 检查端口是否被占用，可以修改vite.config.ts中的端口配置：
```typescript
export default defineConfig({
  server: {
    port: 3001, // 修改为其他可用端口
  },
})
```

### Q: 安装依赖时遇到node-sass相关错误？
A: 确保Node.js版本与项目兼容，建议使用Node.js 16或18版本。

### Q: 界面显示异常或样式错乱？
A: 尝试清除缓存并重新安装依赖：
```bash
pnpm cache clean
rm -rf node_modules
pnpm install
```

## 技术栈说明
- 前端框架：React 18+
- 类型系统：TypeScript
- 构建工具：Vite
- 样式解决方案：Tailwind CSS
- 状态管理：React Context API
- 路由管理：React Router v6
- 图表库：Recharts

## 联系方式
如有任何环境配置问题，请联系：
- 史晓 3230100394@zju.edu.cn