const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 数据存储目录
const DATA_DIR = path.join(__dirname, "data");

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// 路由前的错误处理中间件
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "无效的请求数据" });
  }
  next();
});

// API 路由前缀
app.use("/api", (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 获取当前日期的文件名
function getCurrentFileName() {
  const date = new Date();
  return `application_${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}.txt`;
}

// 保存申请数据
app.post("/api/applications", async (req, res) => {
  try {
    console.log("收到新的申请:", req.body); // 记录接收到的数据

    if (!req.body.name || !req.body.grade || !req.body.introduction) {
      console.log("数据验证失败:", req.body);
      return res.status(400).json({ error: "请填写所有必需信息" });
    }

    await ensureDataDir();

    const fileName = getCurrentFileName();
    const filePath = path.join(DATA_DIR, fileName);

    // 准备要保存的数据
    const applicationData = {
      timestamp: new Date().toISOString(),
      ...req.body,
    };

    // 读取现有数据（如果文件存在）
    let existingData = [];
    try {
      const fileContent = await fs.readFile(filePath, "utf8");
      existingData = JSON.parse(fileContent);
    } catch (error) {
      console.log("创建新的数据文件");
      // 文件不存在或为空，使用空数组
    }

    // 添加新数据
    existingData.push(applicationData);

    // 保存数据到文件
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), "utf8");
    console.log("数据保存成功");

    res.status(201).json({
      message: "申请已保存",
      timestamp: applicationData.timestamp,
    });
  } catch (error) {
    console.error("保存申请失败:", error);
    res.status(500).json({ error: "保存申请失败: " + error.message });
  }
});

// 获取指定日期的申请数据
app.get("/api/applications/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const filePath = path.join(DATA_DIR, `application_${date}.txt`);

    const fileContent = await fs.readFile(filePath, "utf8");
    const applications = JSON.parse(fileContent);

    res.json(applications);
  } catch (error) {
    res.status(404).json({ error: "未找到数据" });
  }
});

// 获取所有申请数据
app.get("/api/applications", async (req, res) => {
  try {
    await ensureDataDir();

    // 读取data目录下的所有文件
    const files = await fs.readdir(DATA_DIR);
    const applicationFiles = files.filter((file) =>
      file.startsWith("application_")
    );

    const allApplications = [];

    // 读取每个文件的内容
    for (const file of applicationFiles) {
      const filePath = path.join(DATA_DIR, file);
      const fileContent = await fs.readFile(filePath, "utf8");
      const applications = JSON.parse(fileContent);
      allApplications.push(...applications);
    }

    // 按时间戳排序
    allApplications.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.json(allApplications);
  } catch (error) {
    console.error("获取申请数据失败:", error);
    res.status(500).json({ error: "获取申请数据失败" });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`数据存储目录: ${DATA_DIR}`);
});
