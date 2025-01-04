// 初始化默认管理员账号
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
        {
            username: 'admin',
            password: '123456',
            isAdmin: true
        }
    ]));
}

// 全局变量
let bgMusic = null;
let isPlaying = false;
let selectedImage = null;

// 添加临时图片存储
let tempImages = {};

// 添加验证码相关变量
let verificationCode = '';

// 生成随机验证码
function generateVerificationCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// 刷新验证码
function refreshVerificationCode() {
    verificationCode = generateVerificationCode();
    const display = document.getElementById('verificationDisplay');
    if (display) {
        display.textContent = verificationCode;
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'user.html') {
        initUserPage();
        initMusicPlayer();
    } else if (currentPage === 'admin.html') {
        initAdminPage();
    }

    const loginLeft = document.querySelector('.login-left');
    if (loginLeft) {
        const img = new Image();
        img.src = './assets/生成日常事务背景图.png';
        
        img.onerror = function() {
            console.error('背景图片加载失败');
            loginLeft.classList.add('no-image');
        };
    }
});

// 初始化音乐播放器
function initMusicPlayer() {
    bgMusic = document.getElementById('bgMusic');
    const volumeControl = document.getElementById('volumeControl');
    
    // 设置初始音量
    bgMusic.volume = volumeControl.value / 100;
    
    // 音量控制
    volumeControl.addEventListener('input', (e) => {
        bgMusic.volume = e.target.value / 100;
    });
    
    // 音频加载错误处理
    bgMusic.addEventListener('error', (e) => {
        console.error('音乐加载失败:', e);
        document.querySelector('.music-player').style.display = 'none';
    });

    // 添加音频加载成功处理
    bgMusic.addEventListener('loadeddata', () => {
        console.log('音乐加载成功');
        document.querySelector('.music-player').style.display = 'block';
    });
}

// 切换音乐播放状态
function toggleMusic() {
    if (!bgMusic) return;
    
    const musicBtn = document.getElementById('musicBtn');
    const status = document.getElementById('musicStatus');
    
    try {
        if (isPlaying) {
            bgMusic.pause();
            status.textContent = '播放音乐';
            musicBtn.classList.remove('playing');
        } else {
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        status.textContent = '暂停音乐';
                        musicBtn.classList.add('playing');
                    })
                    .catch(error => {
                        console.error('播放失败:', error);
                        alert('音乐播放失败，请重试');
                    });
            }
        }
        isPlaying = !isPlaying;
    } catch (error) {
        console.error('音乐控制错误:', error);
    }
}

// 登录表单切换
function showLoginForm(type) {
    document.querySelectorAll('.login-form').forEach(form => form.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (type === 'user') {
        document.getElementById('userLoginForm').classList.add('active');
    } else {
        document.getElementById('adminLoginForm').classList.add('active');
    }
    event.target.classList.add('active');
}

function showRegisterForm() {
    // 清空所有输入框
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('verificationCode').value = '';
    
    // 生成新的验证码
    refreshVerificationCode();
    
    // 显示注册表单
    document.querySelectorAll('.login-form').forEach(form => form.classList.remove('active'));
    document.getElementById('registerForm').classList.add('active');
}

// 用户相关函数
function login(type) {
    const username = document.getElementById(type === 'user' ? 'username' : 'adminUsername').value;
    const password = document.getElementById(type === 'user' ? 'password' : 'adminPassword').value;

    if (!username || !password) {
        alert('请填写完整的登录信息');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        alert('用户名或密码错误');
        return;
    }

    if (type === 'admin' && !user.isAdmin) {
        alert('无管理员权限');
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = type === 'user' ? 'user.html' : 'admin.html';
}

function validatePassword(password) {
    // 检查密码是否包含数字
    const hasNumber = /\d/.test(password);
    // 检查密码是否包含小写字母
    const hasLowerCase = /[a-z]/.test(password);
    // 检查密码是否包含大写字母
    const hasUpperCase = /[A-Z]/.test(password);
    
    return hasNumber && hasLowerCase && hasUpperCase;
}

function register() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const inputCode = document.getElementById('verificationCode').value;

    // 基本验证
    if (!username || !password || !confirmPassword || !inputCode) {
        alert('请填写所有注册信息');
        return;
    }

    // 验证码验证
    if (inputCode !== verificationCode) {
        alert('验证码错误');
        refreshVerificationCode();
        document.getElementById('verificationCode').value = '';
        return;
    }

    // 密码复杂度验证
    if (!validatePassword(password)) {
        alert('密码必须包含数字、大写字母和小写字母');
        return;
    }

    if (password !== confirmPassword) {
        alert('两次输入的密码不一致，请重新输入');
        return;
    }

    // 检查用户名是否已存在
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.username === username)) {
        alert('用户名已存在');
        return;
    }

    // 创建新用户
    users.push({
        username,
        password,
        isAdmin: false,
        createdAt: new Date().toISOString()
    });

    // 保存用户信息
    localStorage.setItem('users', JSON.stringify(users));
    alert('注册成功！请登录');
    
    // 清空表单并切换到登录页
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('verificationCode').value = '';
    showLoginForm('user');
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// 用户页面初始化
function initUserPage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userDisplayName').textContent = currentUser.username;
    loadTasks();
}

// 任务相关函数
function loadTasks() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`) || '[]');
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'completed' : ''}`;
    div.setAttribute('data-id', task.id);
    
    const canUploadMore = !task.images || task.images.length < 3;
    let taskHtml = `
        <div class="task-item-header">
            <div class="checkbox-wrapper">
                <input type="checkbox" 
                    id="task_${task.id}" 
                    ${task.completed ? 'checked' : ''} 
                    onchange="toggleTask('${task.id}', this)">
                <label for="task_${task.id}" class="checkbox-label"></label>
            </div>
            <div class="task-content">
                <h3 class="task-title">${task.title}</h3>
                <div class="task-actions">
                    <button onclick="editTask('${task.id}')" class="edit-btn" ${task.completed ? 'disabled' : ''}>编辑</button>
                    <button onclick="deleteTask('${task.id}')" class="delete-btn">删除</button>
                </div>
            </div>
        </div>
        <div class="task-details" style="display: none;">
            <textarea class="task-text-editor" placeholder="添加详细内容...">${task.content || ''}</textarea>
            <div class="task-image-upload">
                <input type="file" id="image_${task.id}" accept="image/*" multiple style="display: none;" 
                    onchange="handleTaskImages('${task.id}', this.files)" ${!canUploadMore ? 'disabled' : ''}>
                <button onclick="document.getElementById('image_${task.id}').click()" 
                    class="upload-btn ${!canUploadMore ? 'disabled' : ''}" 
                    ${!canUploadMore ? 'disabled' : ''}>
                    <span class="upload-icon">📷</span>
                    添加图片 ${task.images ? `(${task.images.length}/3)` : '(0/3)'}
                </button>
            </div>
            <div class="task-images">
                ${(task.images || []).map((img, index) => `
                    <div class="task-image-container">
                        <img src="${img}" alt="任务图片" class="task-image">
                        <button onclick="removeTaskImage('${task.id}', ${index})" class="remove-image">×</button>
                    </div>
                `).join('')}
            </div>
            <div class="task-footer">
                <span class="time-info">${formatDate(new Date(task.createdAt))}</span>
                <div class="button-group">
                    <button onclick="discardChanges('${task.id}')" class="discard-btn">不保存</button>
                    <button onclick="saveTaskDetails('${task.id}')" class="save-btn">保存</button>
                </div>
            </div>
        </div>
    `;
    
    div.innerHTML = taskHtml;
    return div;
}

function addTask() {
    const titleInput = document.getElementById('taskTitle');
    const title = titleInput.value.trim();

    if (!title) {
        alert('请输入事务标题');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`) || '[]');
    
    tasks.push({
        id: Date.now().toString(),
        title: title,
        content: '',
        images: [],
        createdAt: new Date().toISOString()
    });

    localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasks));
    titleInput.value = '';
    loadTasks();
}

function toggleTask(taskId, checkbox) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`) || '[]');
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        task.completed = checkbox.checked;
        localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasks));
        
        // 更新UI
        const taskElement = checkbox.closest('.task-item');
        if (taskElement) {
            if (task.completed) {
                taskElement.classList.add('completed');
                // 禁用编辑按钮
                const editBtn = taskElement.querySelector('.edit-btn');
                if (editBtn) {
                    editBtn.disabled = true;
                }
                // 如果编辑区域是打开的，自动收起
                const detailsElement = taskElement.querySelector('.task-details');
                if (detailsElement && detailsElement.style.display !== 'none') {
                    detailsElement.style.opacity = '0';
                    detailsElement.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        detailsElement.style.display = 'none';
                        detailsElement.style.opacity = '';
                        detailsElement.style.transform = '';
                    }, 300);
                }
            } else {
                taskElement.classList.remove('completed');
                // 启用编辑按钮
                const editBtn = taskElement.querySelector('.edit-btn');
                if (editBtn) {
                    editBtn.disabled = false;
                }
            }
        }
    }
}

function deleteTask(taskId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`) || '[]');
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasks));
    loadTasks();
}

// 密码修改相关函数
function showChangePasswordModal() {
    document.getElementById('changePasswordModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('changePasswordModal').style.display = 'none';
}

function changePassword() {
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
        alert('请填写所有密码字段');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert('两次输入的新密码不一致');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === currentUser.username);

    if (user.password !== oldPassword) {
        alert('原密码错误');
        return;
    }

    user.password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(user));

    alert('密码修改成功！');
    closeModal();
}

// 管理员页面相关函数
function initAdminPage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = 'index.html';
        return;
    }
    loadUsers();
}

// 加载用户列表
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userList = document.querySelector('#userList');
    
    // 清空现有内容
    userList.innerHTML = '';
    
    // 只显示普通用户
    const normalUsers = users.filter(user => !user.isAdmin);
    
    normalUsers.forEach(user => {
        const row = `
            <tr>
                <td>${user.username}</td>
                <td>${formatDate(new Date(user.createdAt))}</td>
                <td>
                    <div class="user-actions">
                        <button onclick="resetPassword('${user.username}')" class="reset-pwd-btn">重置密码</button>
                        <button onclick="deleteUser('${user.username}')" class="delete-user-btn">删除用户</button>
                    </div>
                </td>
            </tr>
        `;
        userList.insertAdjacentHTML('beforeend', row);
    });
}

// 搜索用户
function searchUsers() {
    const searchTerm = document.getElementById('searchUser').value.toLowerCase();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userList = document.querySelector('#userList');
    
    // 清空现有内容
    userList.innerHTML = '';
    
    // 过滤并只显示普通用户
    const filteredUsers = users.filter(user => 
        !user.isAdmin && user.username.toLowerCase().includes(searchTerm)
    );
    
    filteredUsers.forEach(user => {
        const row = `
            <tr>
                <td>${user.username}</td>
                <td>${formatDate(new Date(user.createdAt))}</td>
                <td>
                    <div class="user-actions">
                        <button onclick="resetPassword('${user.username}')" class="reset-pwd-btn">重置密码</button>
                        <button onclick="deleteUser('${user.username}')" class="delete-user-btn">删除用户</button>
                    </div>
                </td>
            </tr>
        `;
        userList.insertAdjacentHTML('beforeend', row);
    });
}

// 删除用户
function deleteUser(username) {
    if (!confirm(`确定要删除用户 "${username}" 吗？`)) {
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users = users.filter(u => u.username !== username);
    localStorage.setItem('users', JSON.stringify(users));
    
    // 删除该用户的所有任务
    localStorage.removeItem(`tasks_${username}`);
    
    loadUsers();
}

// 重置密码
function resetPassword(username) {
    if (!confirm(`确定要重置用户 "${username}" 的密码吗？`)) {
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username);
    
    if (user) {
        user.password = '123456'; // 重置为默认密码
        localStorage.setItem('users', JSON.stringify(users));
        alert(`密码已重置为：123456`);
    }
}

// 添加时间信息格式化函数
function getTimeInfo(task) {
    const createdDate = new Date(task.createdAt);
    const createdStr = `创建于: ${formatDate(createdDate)}`;
    
    if (task.completed && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const timeSpent = formatTimeSpent(task.timeSpent);
        return `${createdStr}<br>完成于: ${formatDate(completedDate)}<br>耗时: ${timeSpent}`;
    }
    
    return createdStr;
}

// 日期格式化函数
function formatDate(date) {
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
}

// 数字补零函数
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// 时间间隔格式化函数
function formatTimeSpent(milliseconds) {
    if (!milliseconds) return '';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days}天${hours % 24}小时`;
    } else if (hours > 0) {
        return `${hours}小时${minutes % 60}分钟`;
    } else if (minutes > 0) {
        return `${minutes}分钟`;
    } else {
        return `${seconds}秒`;
    }
}

// 添加搜索功能
function searchTasks() {
    const searchText = document.getElementById('searchTask').value.toLowerCase();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`) || '[]');
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    const filteredTasks = tasks.filter(task => 
        task.content.toLowerCase().includes(searchText)
    );

    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div class="no-tasks">没有找到匹配的事务</div>';
        return;
    }

    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

// 添加相关样式
const style = document.createElement('style');
style.textContent = `
    .no-tasks {
        text-align: center;
        padding: 20px;
        color: #666;
        font-style: italic;
    }
`;
document.head.appendChild(style);

// 添加图片预览功能
document.getElementById('taskImage')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImage = e.target.result;
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `
                <div class="preview-image">
                    <img src="${selectedImage}" alt="预览图片">
                    <button class="remove-image" onclick="removeImage()">×</button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
});

function removeImage() {
    selectedImage = null;
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('taskImage').value = '';
}

// 修改编辑任务函数
function editTask(taskId) {
    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
    const detailsElement = taskElement.querySelector('.task-details');
    const textEditor = taskElement.querySelector('.task-text-editor');
    
    if (detailsElement.style.display === 'none') {
        // 打开编辑区域时，加载原始内容
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`) || '[]');
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            textEditor.value = task.content || '';
            detailsElement.style.display = 'block';
        }
    } else {
        // 关闭编辑区域时，如果没有点击保存，则丢弃更改
        if (confirm('关闭编辑将丢失未保存的更改，确定要关闭吗？')) {
            // 重置内容为原始内容
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`) || '[]');
            const task = tasks.find(t => t.id === taskId);
            
            if (task) {
                textEditor.value = task.content || '';
            }
            
            // 重置图片显示
            const imagesContainer = taskElement.querySelector('.task-images');
            imagesContainer.innerHTML = (task.images || []).map((img, index) => `
                <div class="task-image-container">
                    <img src="${img}" alt="任务图片" class="task-image">
                    <button onclick="removeTaskImage('${taskId}', ${index})" class="remove-image">×</button>
                </div>
            `).join('');
            
            // 更新上传按钮状态
            const uploadBtn = taskElement.querySelector('.upload-btn');
            const uploadInput = taskElement.querySelector(`#image_${taskId}`);
            uploadBtn.classList.remove('disabled');
            uploadBtn.disabled = false;
            uploadInput.disabled = false;
            
            // 更新图片计数
            uploadBtn.innerHTML = `
                <span class="upload-icon">📷</span>
                添加图片 (${(task.images || []).length}/3)
            `;
            
            // 隐藏编辑区域
            detailsElement.style.display = 'none';
        }
    }
}

// 修改保存任务详情函数
function saveTaskDetails(taskId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`) || '[]');
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskElement) {
            // 获取内容
            const content = taskElement.querySelector('.task-text-editor').value;
            task.content = content || '';
            
            // 保存临时图片到任务中
            if (tempImages[taskId]) {
                task.images = [...tempImages[taskId]];
                delete tempImages[taskId]; // 清除临时存储
            }
            
            // 保存到本地存储
            localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasks));
            
            // 添加保存动画效果
            const detailsElement = taskElement.querySelector('.task-details');
            if (detailsElement) {
                // 添加保存成功的视觉反馈
                const saveBtn = taskElement.querySelector('.save-btn');
                if (saveBtn) {
                    saveBtn.textContent = '已保存';
                    saveBtn.style.backgroundColor = '#68d391';
                    
                    // 0.8秒后开始收起动画
                    setTimeout(() => {
                        detailsElement.style.opacity = '0';
                        detailsElement.style.transform = 'translateY(-10px)';
                        
                        // 等待动画完成后隐藏
                        setTimeout(() => {
                            detailsElement.style.display = 'none';
                            // 重置样式，为下次打开做准备
                            detailsElement.style.opacity = '';
                            detailsElement.style.transform = '';
                            // 重置按钮文本
                            saveBtn.textContent = '保存';
                            saveBtn.style.backgroundColor = '';
                        }, 300);
                    }, 800);
                }
            }
        }
    }
}

// 添加图片压缩函数
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // 计算压缩比例
                const maxSize = 800; // 最大尺寸
                if (width > height && width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                } else if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // 压缩图片质量
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
                resolve(compressedDataUrl);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// 修改图片处理函数
function handleTaskImages(taskId, files) {
    if (!files || files.length === 0) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`) || '[]');
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        // 初始化临时图片数组
        if (!tempImages[taskId]) {
            tempImages[taskId] = [...(task.images || [])];
        }
        
        if (tempImages[taskId].length >= 3) {
            alert('最多只能上传3张图片');
            return;
        }

        const remainingSlots = 3 - tempImages[taskId].length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);
        let processedFiles = 0;
        
        filesToProcess.forEach(async (file) => {
            try {
                const compressedImage = await compressImage(file);
                
                const sizeInMB = (compressedImage.length * 0.75) / (1024 * 1024);
                if (sizeInMB > 1) {
                    alert('图片太大，请选择小于1MB的图片');
                    return;
                }

                // 添加到临时存储而不是直接保存
                tempImages[taskId].push(compressedImage);
                processedFiles++;
                
                if (processedFiles === filesToProcess.length) {
                    // 更新UI，但使用临时图片数组
                    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
                    if (taskElement) {
                        const imagesContainer = taskElement.querySelector('.task-images');
                        imagesContainer.innerHTML = tempImages[taskId].map((img, index) => `
                            <div class="task-image-container">
                                <img src="${img}" alt="任务图片" class="task-image">
                                <button onclick="removeTaskImage('${taskId}', ${index})" class="remove-image">×</button>
                            </div>
                        `).join('');
                        
                        // 更新上传按钮状态
                        const uploadBtn = taskElement.querySelector('.upload-btn');
                        const uploadInput = taskElement.querySelector(`#image_${taskId}`);
                        if (tempImages[taskId].length >= 3) {
                            uploadBtn.classList.add('disabled');
                            uploadBtn.disabled = true;
                            uploadInput.disabled = true;
                        }
                        
                        uploadBtn.innerHTML = `
                            <span class="upload-icon">📷</span>
                            添加图片 (${tempImages[taskId].length}/3)
                        `;
                    }
                }
            } catch (error) {
                console.error('Image compression error:', error);
                alert('图片处理失败，请重试');
            }
        });
    }
}

// 修改删除图片函数
function removeTaskImage(taskId, imageIndex) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`) || '[]');
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        task.images.splice(imageIndex, 1);
        localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasks));
        
        // 只更新当前任务的图片显示
        const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskElement) {
            const imagesContainer = taskElement.querySelector('.task-images');
            imagesContainer.innerHTML = task.images.map((img, index) => `
                <div class="task-image-container">
                    <img src="${img}" alt="任务图片" class="task-image">
                    <button onclick="removeTaskImage('${taskId}', ${index})" class="remove-image">×</button>
                </div>
            `).join('');
            
            // 更新上传按钮状态
            const uploadBtn = taskElement.querySelector('.upload-btn');
            const uploadInput = taskElement.querySelector(`#image_${taskId}`);
            uploadBtn.classList.remove('disabled');
            uploadBtn.disabled = false;
            uploadInput.disabled = false;
            
            // 更新图片计数
            uploadBtn.innerHTML = `
                <span class="upload-icon">📷</span>
                添加图片 (${task.images.length}/3)
            `;
        }
    }
}

// 添加清除已完成任务函数
function clearCompletedTasks() {
    if (!confirm('确定要删除所有已完成的事务吗？')) {
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`) || '[]');
    
    // 获取所有已完成的任务元素
    const completedTaskElements = document.querySelectorAll('#completedTasks .task-item');
    
    // 添加删除动画
    completedTaskElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
        element.classList.add('deleting');
    });

    // 等待动画完成后删除任务
    setTimeout(() => {
        // 过滤掉已完成的任务
        tasks = tasks.filter(task => !task.completed);
        
        // 更新本地存储
        localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasks));
        
        // 重新加载任务列表
        loadTasks();
    }, completedTaskElements.length * 100 + 300); // 根据任务数量调整延迟时间
}

// 修改丢弃更改函数
function discardChanges(taskId) {
    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
    if (taskElement) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`) || '[]');
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            // 清除临时图片存储
            delete tempImages[taskId];
            
            // 重置文本内容
            const textEditor = taskElement.querySelector('.task-text-editor');
            textEditor.value = task.content || '';
            
            // 重置图片显示为原始保存的图片
            const imagesContainer = taskElement.querySelector('.task-images');
            const originalImages = task.images || [];
            imagesContainer.innerHTML = originalImages.map((img, index) => `
                <div class="task-image-container">
                    <img src="${img}" alt="任务图片" class="task-image">
                    <button onclick="removeTaskImage('${taskId}', ${index})" class="remove-image">×</button>
                </div>
            `).join('');
            
            // 重置文件输入框
            const fileInput = taskElement.querySelector(`#image_${taskId}`);
            if (fileInput) {
                fileInput.value = '';
            }
            
            // 更新上传按钮状态
            const uploadBtn = taskElement.querySelector('.upload-btn');
            const uploadInput = taskElement.querySelector(`#image_${taskId}`);
            uploadBtn.classList.remove('disabled');
            uploadBtn.disabled = false;
            uploadInput.disabled = false;
            
            // 更新图片计数
            uploadBtn.innerHTML = `
                <span class="upload-icon">📷</span>
                添加图片 (${originalImages.length}/3)
            `;
            
            // 添加丢弃动画效果
            const detailsElement = taskElement.querySelector('.task-details');
            detailsElement.style.opacity = '0';
            detailsElement.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                detailsElement.style.display = 'none';
                detailsElement.style.opacity = '';
                detailsElement.style.transform = '';
            }, 300);
        }
    }
}

// 添加回车搜索功能
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        searchUsers();
    }
}

