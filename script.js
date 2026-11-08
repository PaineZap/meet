/**
 * LAZIMEET - GenZ Video Conferencing powered by Jitsi Meet API
 * Built for GitHub Pages (100% Client-side, No Backend required)
 */

// DOM Elements
const homeScreen = document.getElementById('home-screen');
const meetingScreen = document.getElementById('meeting-screen');
const creatorNameInput = document.getElementById('creator-name');
const joinNameInput = document.getElementById('join-name');
const roomCodeInput = document.getElementById('room-code-input');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnJoinRoom = document.getElementById('btn-join-room');
const currentRoomBadge = document.getElementById('current-room-badge');
const btnCopyLink = document.getElementById('btn-copy-link');

let jitsiApi = null;

// Tab Switching on Home Screen
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// Auto check URL parameters for direct room joining via shared link
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
        roomCodeInput.value = roomParam;
        document.querySelector('[data-tab="join"]').click();
    }

    // Default fun GenZ random names
    const randomNames = ['Nam Phong', 'Thảo My', 'Gia Hân', 'Hoàng Long', 'Minh Thư', 'Quốc Bảo', 'Khánh Linh'];
    const defaultName = randomNames[Math.floor(Math.random() * randomNames.length)];
    if (creatorNameInput) creatorNameInput.value = defaultName;
    if (joinNameInput) joinNameInput.value = defaultName;
});

// Toast Notification Helper
function showToast(message, icon = 'fa-solid fa-sparkles') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// Create Room Button Event
if (btnCreateRoom) {
    btnCreateRoom.addEventListener('click', () => {
        const name = creatorNameInput.value.trim() || 'GenZ Host';
        const roomId = 'lazimeet-' + Math.random().toString(36).substring(2, 9);
        startMeeting(roomId, name);
    });
}

// Join Room Button Event
if (btnJoinRoom) {
    btnJoinRoom.addEventListener('click', () => {
        const name = joinNameInput.value.trim() || 'GenZ Guest';
        let roomInput = roomCodeInput.value.trim();
        if (!roomInput) {
            showToast('Vui lòng nhập mã phòng hoặc đường dẫn!', 'fa-solid fa-circle-exclamation');
            return;
        }
        if (roomInput.includes('room=')) {
            try {
                const url = new URL(roomInput.includes('http') ? roomInput : 'https://' + roomInput);
                roomInput = url.searchParams.get('room') || roomInput;
            } catch (e) {}
        }
        startMeeting(roomInput, name);
    });
}

// Initialize Jitsi Meeting Session
function startMeeting(roomId, displayName) {
    homeScreen.classList.remove('active');
    meetingScreen.classList.add('active');
    currentRoomBadge.textContent = `Phòng: ${roomId}`;
    showToast('Đang kết nối vào phòng họp...', 'fa-solid fa-spinner fa-spin');

    // Cấu hình Jitsi Meet API sử dụng server cộng đồng hoàn toàn miễn phí
    const domain = "meet.jit.si";
    const options = {
        roomName: "LaziMeet-" + roomId,
        width: "100%",
        height: "100%",
        parentNode: document.querySelector('#jitsi-container'),
        userInfo: {
            displayName: displayName
        },
        configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false // Bỏ qua trang chờ để vào phòng ngay lập tức
        },
        interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'chat', 'settings', 'raisehand',
                'videoquality', 'tileview'
            ],
            SHOW_JITSI_WATERMARK: false,
            DEFAULT_REMOTE_DISPLAY_NAME: 'Thành viên'
        }
    };

    try {
        jitsiApi = new JitsiMeetExternalAPI(domain, options);

        jitsiApi.addEventListeners({
            readyToClose: () => {
                // Khi người dùng bấm nút rời phòng (hangup)
                window.location.href = window.location.pathname;
            },
            participantJoined: (participant) => {
                showToast(`${participant.displayName || 'Một thành viên'} đã vào phòng`, 'fa-solid fa-user-plus');
            },
            videoConferenceLeft: () => {
                window.location.href = window.location.pathname;
            }
        });
    } catch (err) {
        console.error("Lỗi khởi tạo Jitsi API:", err);
        showToast('Không thể tải khung họp trực tuyến. Vui lòng thử lại!', 'fa-solid fa-triangle-exclamation');
    }
}

// Copy Invitation Link Button
if (btnCopyLink) {
    btnCopyLink.addEventListener('click', () => {
        const roomText = currentRoomBadge.textContent.replace('Phòng: ', '');
        const currentUrl = window.location.origin + window.location.pathname + '?room=' + roomText;
        navigator.clipboard.writeText(currentUrl);
        showToast('Đã sao chép đường dẫn mời vào bộ nhớ tạm!', 'fa-solid fa-clipboard-check');
    });
}
