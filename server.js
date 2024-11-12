const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
// const cors = require('cors');
const app = express();
// 全局启用 CORS
// app.use(cors());
// 提供 public 文件夹中的静态文件
app.use(express.static('public'));
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';
const VIDEO_PATH = path.join(__dirname, 'videos', 'example.mp4');

// 生成签名
function generateSignature(expire) {
    return crypto.createHmac('sha256', SECRET_KEY)
      .update(`${expire}`)
      .digest('hex');
  }
  
  // 生成视频链接
  function generateVideoUrl(expire) {
    const signature = generateSignature(expire);
    return `http://localhost:${PORT}/video?expire=${expire}&signature=${signature}`;
  }
 
  
  // 获取视频链接的接口
  app.get('/get-video-link', (req, res) => {
    const expire = Math.floor(Date.now() / 1000) + 10; // 有效期为1小时
    const videoUrl = generateVideoUrl(expire);
    res.json({ videoUrl });
  });
  
  // 处理视频请求
  app.get('/video', (req, res) => {
    const { expire, signature } = req.query;
  
    // 验证签名
    const expectedSignature = generateSignature(expire);
  
    if (signature !== expectedSignature || Date.now() > parseInt(expire) * 1000) {
      return res.status(403).send('Invalid or expired link');
    }
  
    // 返回视频流
    const videoStream = fs.createReadStream(VIDEO_PATH);
    res.set('Content-Type', 'video/mp4');
    videoStream.pipe(res);
  });
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });