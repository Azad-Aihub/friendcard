addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

addEventListener('scheduled', event => {
  event.waitUntil(cleanUpExpiredEntries());
});

const rateLimitMap = new Map();
const RATE_LIMIT = 500;
const TIME_WINDOW = 60 * 60 * 1000;
const MAX_MAP_SIZE = 10000;

async function handleRequest(request) {
  const clientIP = request.headers.get('cf-connecting-ip');
  if (!clientIP) {
    return new Response('无法识别客户端 IP', { status: 400 });
  }

  const rateLimitResponse = checkRateLimit(clientIP);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const url = new URL(request.url);
    const friendName = sanitizeInput(url.searchParams.get('name')) || '友链卡片生成器';
    const specialty = sanitizeInput(url.searchParams.get('specialty')) || '生成一个类似我这样的卡片';
    const displayLink = sanitizeInput(url.searchParams.get('link')) || 'https://card.azad.asia';
    const redirectLink = sanitizeInput(url.searchParams.get('redirect')) || 
      (displayLink.startsWith('http') ? displayLink : `https://${displayLink}`);
    const avatarLink = sanitizeInput(url.searchParams.get('avatar'));
    const domain = displayLink !== 'https://card.azad.asia' ? 
      (new URL(displayLink.startsWith('http') ? displayLink : `https://${displayLink}`)).hostname : 
      'card.azad.asia';

    const styles = {
      bgcolor: sanitizeInput(url.searchParams.get('bgcolor')) || 'linear-gradient(135deg, #e0e7ff, #f0f4f8)',
      textcolor: sanitizeInput(url.searchParams.get('textcolor')) || '#1f2937',
      linkcolor: sanitizeInput(url.searchParams.get('linkcolor')) || '#2563eb',
      font: sanitizeInput(url.searchParams.get('font')) || 'ZCOOL KuaiLe'
    };

    const html = generateHTML(friendName, specialty, displayLink, redirectLink, avatarLink, domain, styles);

    return new Response(html, {
      headers: { 'content-type': 'text/html;charset=UTF-8' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response('Error processing request', { status: 500 });
  }
}

function checkRateLimit(clientIP) {
  const currentTime = Date.now();
  let record = rateLimitMap.get(clientIP);

  if (!record) {
    record = { count: 0, startTime: currentTime };
    rateLimitMap.set(clientIP, record);
  }

  if (currentTime - record.startTime >= TIME_WINDOW) {
    record.count = 0;
    record.startTime = currentTime;
  }

  if (record.count >= RATE_LIMIT) {
    return new Response('请求过多，请稍后再试。', { status: 429 });
  }

  record.count++;
  rateLimitMap.set(clientIP, record);

  return null;
}

function cleanUpExpiredEntries() {
  if (rateLimitMap.size > MAX_MAP_SIZE) {
    const currentTime = Date.now();
    for (const [ip, record] of rateLimitMap) {
      if (currentTime - record.startTime >= TIME_WINDOW) {
        rateLimitMap.delete(ip);
      }
    }
  }
}

function sanitizeInput(input) {
  return input ? input.replace(/[<>]/g, '') : '';
}

function isValidURL(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function generateHTML(name, specialty, displayLink, redirectLink, avatarLink, domain, styles = {}) {
  const { 
    bgcolor = 'linear-gradient(135deg, #e0e7ff, #f0f4f8)', 
    textcolor = '#1f2937', 
    linkcolor = '#2563eb', 
    font = 'ZCOOL KuaiLe' 
  } = styles;
  
  let avatarURL;
  if (avatarLink) {
    avatarURL = avatarLink;
  } else if (displayLink && displayLink !== 'https://card.azad.asia') {
    avatarURL = `https://api.faviconkit.com/${domain}/128`;
  } else {
    avatarURL = 'https://card.azad.asia/favicon.svg';
  }

  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;700&family=LXGW+WenKai&family=ZCOOL+XiaoWei&family=ZCOOL+QingKe+HuangYou&family=Ma+Shan+Zheng&family=Zhi+Mang+Xing&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600&family=Open+Sans:wght@400;600&family=Inter:wght@400;500;600&family=Montserrat:wght@400;500;600&family=Lato:wght@400;700&family=Source+Sans+Pro:wght@400;600&family=Ubuntu:wght@400;500&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=Nunito+Sans:wght@400;600;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;500;600&family=Raleway:wght@400;500;600&family=Work+Sans:wght@400;500;600&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;700&family=Noto+Kufi+Arabic:wght@400;500;700&family=Amiri:wght@400;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Nanum+Gothic:wght@400;700&family=Nanum+Myeongjo:wght@400;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Vietnamese:wght@400;500;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&family=PT+Sans:wght@400;700&display=swap');
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
        padding: 16px;
      }
      
      .card {
        display: flex;
        align-items: center;
        border: 2px solid #e2e8f0;
        border-radius: 20px;
        padding: 20px;
        background: ${bgcolor};
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        transition: transform 0.3s, box-shadow 0.3s;
        width: 100%;
        max-width: 600px;
        gap: 20px;
      }
      
      .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.2);
      }
      
      .avatar {
        flex-shrink: 0;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .avatar img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        object-fit: cover;
      }
      
      .content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .content h3 {
        margin: 0 0 10px 0;
        font-size: 1.6em;
        color: #1f2937;
        word-wrap: break-word;
      }
      
      .content p {
        margin: 0 0 10px 0;
        color: ${textcolor};
        font-size: 1em;
        line-height: 1.5;
        font-family: '${font}', sans-serif;
        word-wrap: break-word;
      }
      
      .content a {
        color: ${linkcolor};
        text-decoration: none;
        font-weight: 500;
        transition: color 0.3s;
        display: block;
        word-wrap: break-word;
        word-break: break-all;
      }
      
      .content a:hover {
        color: ${linkcolor}dd;
      }

      @media (max-width: 480px) {
        .card {
          padding: 16px;
        }
        
        .avatar {
          width: 60px;
          height: 60px;
        }
        
        .avatar img {
          width: 60px;
          height: 60px;
        }
        
        .content h3 {
          font-size: 1.4em;
        }
        
        .content p {
          font-size: 0.95em;
        }
      }
    </style>
    <div class="card">
      <div class="avatar">
        <img src="${avatarURL}" alt="${name}'s avatar" onerror="this.onerror=null;this.src='https://card.azad.asia/favicon.svg';">
      </div>
      <div class="content">
        <h3>${name}</h3>
        <p>✨${specialty}✨</p>
        <a href="${redirectLink}" target="_blank">${displayLink}</a>
      </div>
    </div>
  `;
}
