const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// 详细的CORS配置
app.use(
  cors({
    origin: "*", // 允许任何来源的请求
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Authorization"],
    credentials: false, // 使用"*"时必须设为false
  })
);

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  if (req.method === "POST") {
    console.log("Body:", req.body);
  }
  next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error("Error:", err);
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "无效的请求数据格式" });
  }
  next(err);
});

app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, "build")));

// 确保data目录存在
const DATA_DIR = path.join(__dirname, "server", "data"); // 修改保存路径到server/data

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log("Created data directory:", DATA_DIR);
  }
} catch (error) {
  console.error("Error creating data directory:", error);
}

// Helper function to get current date formatted filename
const getDataFileName = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `application_${year}-${month}-${day}.txt`;
};

// 写入数据到文件的函数
const writeDataToFile = (filePath, newData) => {
  try {
    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let existingData = [];
    // 如果文件存在，读取现有数据
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf8");
        existingData = JSON.parse(fileContent);
        if (!Array.isArray(existingData)) {
          existingData = [];
        }
      } catch (error) {
        console.error("Error reading existing file:", error);
        existingData = [];
      }
    }

    // 添加新数据到数组
    existingData.push(newData);

    // 将完整数组写入文件
    const dataString = JSON.stringify(existingData, null, 2);
    fs.writeFileSync(filePath, dataString);

    // 验证文件是否写入成功
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`File size after write: ${stats.size} bytes`);

      // 读取文件内容进行验证
      const content = fs.readFileSync(filePath, "utf8");
      const savedData = JSON.parse(content);
      console.log("Total entries in file:", savedData.length);
      console.log(
        "Last entry:",
        JSON.stringify(savedData[savedData.length - 1], null, 2)
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error writing to file:", error);
    throw error;
  }
};

// API endpoint for submitting applications
app.post("/api/applications", (req, res) => {
  console.log("收到新的申请请求");
  console.log("请求头:", req.headers);
  console.log("请求体:", req.body);

  try {
    const { name, grade, introduction } = req.body;

    // Validate required fields
    if (!name || !grade || !introduction) {
      console.log("缺少必填字段");
      return res.status(400).json({ message: "所有字段都是必填的" });
    }

    // Create application entry
    const timestamp = new Date().toISOString();
    const applicationData = {
      timestamp,
      name,
      grade,
      introduction,
      submitTime: timestamp,
    };

    // 准备文件路径
    const fileName = getDataFileName();
    const filePath = path.join(DATA_DIR, fileName);

    console.log("正在保存到文件:", filePath);
    console.log("保存的数据:", applicationData);

    // 尝试写入文件
    const writeSuccess = writeDataToFile(filePath, applicationData);

    if (writeSuccess) {
      console.log("数据保存成功");
      res.status(200).json({
        message: "申请提交成功",
        timestamp,
      });
    } else {
      throw new Error("文件写入验证失败");
    }
  } catch (error) {
    console.error("处理申请时出错:", error);
    res.status(500).json({ message: "服务器错误，请稍后重试" });
  }
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server is accessible from all network interfaces`);
  console.log(`Data will be saved to: ${DATA_DIR}`);

  // 测试文件写入
  const testFile = path.join(DATA_DIR, "test.txt");
  try {
    fs.writeFileSync(testFile, "Test write access\n");
    console.log("Test file write successful");
    const testContent = fs.readFileSync(testFile, "utf8");
    console.log("Test file content:", testContent);
    fs.unlinkSync(testFile);
    console.log("Test file cleanup successful");
  } catch (error) {
    console.error("File system test failed:", error);
  }
});
