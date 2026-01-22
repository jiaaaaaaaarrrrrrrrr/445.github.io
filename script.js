// ================= 图片加载优化 =================
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.photo-img, .p-image');
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
            img.addEventListener('error', function() {
                this.classList.add('loaded');
            });
        }
    });
    
    const importantImages = [
        './jiayee.png',
        './dm.jpg',
        './skinlab.jpg'
    ];
    
    importantImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

// ================= 灵动岛功能 =================
document.addEventListener('DOMContentLoaded', function() {
    const dynamicIsland = document.getElementById('dynamic-island');
    const islandClose = document.getElementById('island-close');
    const quickContactBtn = document.getElementById('quick-contact');
    const viewProjectsBtn = document.getElementById('view-projects');
    
    let isExpanded = false;
    if (!dynamicIsland) return;
    
    dynamicIsland.addEventListener('click', function(e) {
        if (e.target.closest('.island-btn') || 
            e.target.closest('.island-close') ||
            e.target.closest('#quick-contact') || 
            e.target.closest('#view-projects')) {
            return;
        }
        
        if (isExpanded) {
            collapseIsland();
        } else {
            expandIsland();
        }
    });
    
    if (islandClose) {
        islandClose.addEventListener('click', function(e) {
            e.stopPropagation();
            collapseIsland();
        });
    }
    
    if (quickContactBtn) {
        quickContactBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            collapseIsland();
            const contactEl = document.getElementById('contact');
            if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    if (viewProjectsBtn) {
        viewProjectsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            collapseIsland();
            const workEl = document.getElementById('work');
            if (workEl) workEl.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    function expandIsland() {
        dynamicIsland.classList.remove('collapsed');
        dynamicIsland.classList.add('expanded');
        isExpanded = true;
    }
    
    function collapseIsland() {
        dynamicIsland.classList.remove('expanded');
        dynamicIsland.classList.add('collapsed');
        isExpanded = false;
    }
    
    setTimeout(() => {
        expandIsland();
    }, 1000);
});

// ================= 表单处理 =================
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    const closeSuccessBtn = document.getElementById('close-success-btn');
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', closeSuccessPage);
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSuccessPage();
        }
    });
    
    const successPage = document.getElementById('success-page');
    if (successPage) {
        successPage.addEventListener('click', function(e) {
            if (e.target === successPage) {
                closeSuccessPage();
            }
        });
    }
});

let isSubmitting = false;

// ================= 两个URL =================
const SHEETDB_URL = 'https://sheetdb.io/api/v1/dfe28z5vsvfao';  // 保存到Google Sheets
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxEOzEp54xcevui4NJBJNhPHXjXSKsHP5_As9_cNoO4yXFW5xrTpO5dZ2dANw-G-a_6/exec';  // 发送邮件

// 获取马来西亚时间 (UTC+8)
function getMalaysiaTime() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const malaysiaTime = new Date(utc + (8 * 60 * 60 * 1000));
    
    const year = malaysiaTime.getFullYear();
    const month = String(malaysiaTime.getMonth() + 1).padStart(2, '0');
    const day = String(malaysiaTime.getDate()).padStart(2, '0');
    const hours = String(malaysiaTime.getHours()).padStart(2, '0');
    const minutes = String(malaysiaTime.getMinutes()).padStart(2, '0');
    const seconds = String(malaysiaTime.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function handleFormSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    // 获取输入内容
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const submitBtn = document.getElementById('submit-btn');

    // 验证
    if (!name || !email || !message) {
        alert('请填写所有必填字段');
        isSubmitting = false;
        return;
    }

    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('请输入有效的邮箱地址');
        isSubmitting = false;
        return;
    }

    // 按钮状态
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText ? btnText.textContent : submitBtn.textContent;
    if (btnText) btnText.textContent = '发送中...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        const timestamp = getMalaysiaTime();
        const website = window.location.href;
        
        // 构建数据
        const postData = {
            data: [{
                "时间戳": timestamp,
                "姓名": name,
                "邮箱": email,
                "项目需求": message,
                "来源": "jiayee-portfolio",
                "网站": website
            }]
        };
        
        console.log('准备提交数据...');
        console.log('Apps Script URL:', APPS_SCRIPT_URL);
        console.log('提交数据:', postData);
        
        // ================= 使用 no-cors 模式提交 =================
        // 1. 先提交到 SheetDB（保存数据）
        console.log('提交到 SheetDB...');
        try {
            await fetch(SHEETDB_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ data: [postData.data[0]] })
            });
            console.log('✅ SheetDB 提交完成');
        } catch (sheetdbError) {
            console.warn('SheetDB 提交失败（继续处理）:', sheetdbError);
        }
        
        // 2. 提交到 Apps Script（发送邮件）- 使用 no-cors
        console.log('提交到 Apps Script（no-cors模式）...');
        
        // 使用 no-cors 模式，避免跨域问题
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',  // 关键：使用 no-cors 模式
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })
        .then(() => {
            console.log('✅ Apps Script 请求已发送（no-cors模式）');
            // 显示成功页面
            showSuccessPage();
            document.getElementById('contact-form').reset();
        })
        .catch(error => {
            console.error('Apps Script 请求失败:', error);
            // 即使请求失败，也显示成功（因为数据已保存到 SheetDB）
            showSuccessPage();
            document.getElementById('contact-form').reset();
        });
        
    } catch (error) {
        console.error('提交过程出错:', error);
        alert('提交出错，请稍后重试或直接联系 jiayee344@gmail.com');
    } finally {
        // 恢复按钮状态
        if (btnText) btnText.textContent = originalText;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        isSubmitting = false;
    }
}

function showSuccessPage() {
    const successPage = document.getElementById('success-page');
    if (successPage) {
        successPage.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // 5秒后自动关闭
        setTimeout(() => {
            closeSuccessPage();
        }, 5000);
    }
}

function closeSuccessPage() {
    const successPage = document.getElementById('success-page');
    if (successPage) {
        successPage.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ================= 测试函数 =================
function testSubmit() {
    console.log('测试提交...');
    
    // 填充测试数据
    document.getElementById('name').value = '测试用户';
    document.getElementById('email').value = 'test@example.com';
    document.getElementById('message').value = '测试表单提交功能 - ' + new Date().toLocaleString();
    
    // 触发提交
    const event = new Event('submit', { cancelable: true });
    document.getElementById('contact-form').dispatchEvent(event);
    
    return '测试已触发';
}

// 暴露到全局
window.testSubmit = testSubmit;
window.handleFormSubmit = handleFormSubmit;
window.getMalaysiaTime = getMalaysiaTime;