# System Info API

A REST API built with Express.js and TypeScript that retrieves detailed system information and connected devices, including the default printer on Windows systems.

## 🚀 Features

- ✅ **Operating System Information** - Platform, architecture, and hostname
- ✅ **Hardware Details** - CPU information, memory usage, and system uptime
- ✅ **Network Information** - All IPv4 network interfaces and their addresses
- ✅ **Default Printer Detection** - Windows printer details with driver analysis
- ✅ **Cross-Platform Support** - Designed with Windows focus, extensible to other OS
- ✅ **Real-time Data** - Live system information through REST endpoints
- ✅ **Type-Safe** - Built with TypeScript for better code reliability
- ✅ **Printer Language Detection** - Automatically identifies printer languages (ESC/POS, PCL, PostScript, etc.)

## 🛠️ Technologies

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript superset
- **Node.js OS Module** - Native system utilities (no external dependencies)
- **PowerShell** - Windows system management (for printer detection)
- **Nodemon** - Development server with hot reload

## 📋 Prerequisites

- **Node.js** 16 or higher
- **npm** or **yarn** package manager
- **Windows OS** (for printer detection functionality)
- **PowerShell 5.1+** (for Windows printer queries)
- **TypeScript** 5.0+ (included in dev dependencies)

## 📦 Installation

```bash
# Clone the repository
git clone [your-repository-url]

# Navigate to project directory
cd pcinfo-api

# Install dependencies
npm install

# Create environment file (optional)
cp .env.example .env

# Run in development mode
npm start