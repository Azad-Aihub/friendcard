# 友情链接卡片生成器

## 简介

这是一个部署在 Cloudflare Workers 上的友情链接卡片生成器。它允许用户通过提供 `name`、`specialty` 和 `link` 参数，生成一个卡片形式的 HTML 页面，展示个人或网站的简介、头像和链接。此卡片可以通过嵌入 `iframe` 在任何网页中展示。

## 特性

- 每个卡片包含头像、简介和外部链接。站点头像是调用第三方服务自动爬取的。
- 支持自动验证 URL 链接。
- 限制每个 IP 的请求次数，防止滥用。
- 轻量级，无需额外依赖，适用于各种网站。

## 使用方法

### 1. 直接嵌入卡片

您可以通过以下代码嵌入卡片到您的网页中。只需替换 `name`、`specialty` 和 `link` 参数即可：

```html
<div style="max-width: 600px; margin: 0 auto;">
  <iframe src="https://friendcards.zwei.de.eu.org/?name=Zwei&specialty=一只野生的大学生&link=https://zwei.de.eu.org" 
          style="border:none; width:100%; height:160px;" 
          scrolling="no"></iframe>
</div>
```

效果：

![{1EDF97F3-C85E-462F-89CE-755C122B0D5F}](https://github.com/user-attachments/assets/31bf8407-c213-402c-bb3e-02f91c8154d3)


#### 参数说明：

- `name`: 卡片中显示的名称（例如：`Zwei`）。
- `specialty`: 卡片中显示的简介（例如：`一只野生的大学生`）。
- `link`: 个人或网站的链接（例如：`https://zwei.de.eu.org`）。

### 2. 生成自定义卡片

通过修改 `iframe` 中的 `src` 参数，您可以动态创建任何自定义的卡片。例如，如果您想要展示自己的网站链接和描述，只需替换为相应的 `name`、`specialty` 和 `link`。

```html
<iframe src="https://friendcards.zwei.de.eu.org/?name=YourName&specialty=YourSpecialty&link=YourLink" 
        style="border:none; width:100%; height:160px;" 
        scrolling="no"></iframe>
```

### 3. 请求速率限制

为了防止滥用，系统对每个 IP 地址进行了请求频率限制。每个 IP 每小时最多可请求 500 次。如果超出限制，系统会返回 HTTP 429 错误，提示用户稍后再试。

## 部署说明

如果您希望在自己的 Cloudflare Worker 中部署此代码，您需要：

1. 创建一个新的 Cloudflare Worker 项目。
2. 将上面的 JavaScript 代码粘贴到 Worker 的代码编辑器中。
3. 配置 Worker 以响应您的自定义域或使用 Cloudflare 提供的默认子域。
4. 配置定时触发器来清理缓存，以确保内存使用不超过限制。

![{触发事件设置}](https://github.com/user-attachments/assets/094e4ca7-5737-4fc0-957c-bd29dcae3736)

