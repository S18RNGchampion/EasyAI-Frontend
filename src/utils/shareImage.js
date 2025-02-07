import { toPng } from 'html-to-image';
import MarkdownIt from 'markdown-it';
import { ElMessage } from 'element-plus';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

/**
 * 生成对话消息的图片并下载
 * @param {Object} message - 需要转换为图片的 AI 消息
 * @param {Array} chat - 当前聊天记录
 * @param {Number} index - 消息在聊天记录中的索引
 */
export const shareAsImage = async (message, chatList, index) => {
  try {
    // 创建一个iframe
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '800px',
      height: '600px',
      border: 'none',
      opacity: '0',
      pointerEvents: 'none'
    });
    document.body.appendChild(iframe);

    // 等待iframe加载完成
    await new Promise(resolve => {
      iframe.onload = resolve;
      iframe.src = 'about:blank';
    });

    // 获取iframe的document
    const iframeDoc = iframe.contentDocument;

    // 创建样式
    const style = document.createElement('style');
    style.textContent = `
      .markdown-content pre {
        background: #f8f9fa;
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 16px 0;
        border: 1px solid #eaecef;
      }
      .markdown-content code {
        font-family: 'SF Mono', Consolas, Menlo, monospace;
        font-size: 14px;
        padding: 3px 6px;
        background: #f8f9fa;
        border-radius: 4px;
        color: #476582;
      }
      .markdown-content p {
        margin: 16px 0;
        line-height: 1.7;
      }
      .markdown-content ul, .markdown-content ol {
        margin: 16px 0;
        padding-left: 24px;
      }
      .markdown-content li {
        margin: 8px 0;
      }
      .markdown-content blockquote {
        margin: 16px 0;
        padding: 0 16px;
        color: #666;
        border-left: 4px solid #42b983;
        background: #f8f9fa;
        border-radius: 0 4px 4px 0;
      }
      .markdown-content h1, .markdown-content h2, .markdown-content h3,
      .markdown-content h4, .markdown-content h5, .markdown-content h6 {
        margin: 24px 0 16px;
        font-weight: 600;
        line-height: 1.25;
      }
      .markdown-content a {
        color: #3eaf7c;
        text-decoration: none;
      }
      .markdown-content img {
        max-width: 100%;
        border-radius: 4px;
        margin: 16px 0;
      }
      .markdown-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
      }
      .markdown-content th, .markdown-content td {
        border: 1px solid #eaecef;
        padding: 8px 16px;
      }
      .markdown-content th {
        background: #f8f9fa;
      }
    `;
    iframeDoc.head.appendChild(style);

    // 获取用户问题和AI回答
    const userQuestion = chatList[index - 1]?.content || '';
    const aiAnswer = md.render(message.content);

    // 创建内容容器
    const container = iframeDoc.createElement('div');
    container.style.width = '800px';
    container.style.padding = '40px';
    container.style.background = '#ffffff';

    // 设置内容
    container.innerHTML = `
      <div style="background: #ffffff; padding: 20px;">
        <div style="margin-bottom: 32px; text-align: center;">
          <div style="font-size: 20px; font-weight: 500; color: #2c3e50; line-height: 1.8; display: inline-block; max-width: 90%; word-wrap: break-word; letter-spacing: 0.5px; font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.05);">${userQuestion}</div>
        </div>
        <hr style="border: none; height: 2px; background-color: black; box-shadow: 0 2px 7px rgba(0, 0, 0, 0.2); margin: 20px 0;">

        <div style="line-height: 1.6; font-size: 15px;">
          <div class="markdown-content" style="color: #2c3e50;">
            ${aiAnswer}
          </div>
        </div>
        <div style="margin-top: 32px; text-align: right; font-size: 13px; color: #999;">
          生成时间：${new Date().toLocaleString()}
        </div>
      </div>
    `;

    iframeDoc.body.appendChild(container);

    // 添加加载提示
    ElMessage.info('正在生成图片，请稍候...');

    // 等待内容渲染
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // 生成图片
      const dataUrl = await toPng(container, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2
      });

      // 下载图片
      const link = document.createElement('a');
      link.download = `AI回答-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();

      ElMessage.success('图片生成成功！');
    } finally {
      // 清理iframe
      document.body.removeChild(iframe);
    }
  } catch (error) {
    console.error('生成图片失败:', error);
    ElMessage.error('生成图片失败，请稍后重试');
  }
};
