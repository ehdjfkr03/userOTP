import { db } from '../firebase-config.js';
import { ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// 🔹 1. 링크 생성 함수
async function generateGuestLink() {
  const residence = sessionStorage.getItem('residence');
  if (!residence) {
    alert('인증 정보가 없습니다.');
    return;
  }

  const token = Math.random().toString(36).substring(2, 10).toUpperCase();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

  const data = {
    residence,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    token
  };

  await set(ref(db, `guestLinks/${token}`), data);

  const link = `${window.location.origin}/guestPage/guest.html?token=${token}`;
  navigator.clipboard.writeText(link);
  alert(`링크가 복사되었습니다:\n${link}`);

  loadGuestLinks(); // 목록 갱신
}

// 🔹 2. 링크 목록 로드
async function loadGuestLinks() {
  const listEl = document.getElementById('link-list');
  listEl.innerHTML = '';

  const snapshot = await get(ref(db, 'guestLinks'));
  if (!snapshot.exists()) {
    listEl.innerHTML = '<li>생성된 링크가 없습니다.</li>';
    return;
  }

  const links = snapshot.val();
  const now = new Date();

  const entries = Object.entries(links)
    .filter(([_, val]) => new Date(val.expiresAt) > now) // 유효한 것만
    .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt));

  for (const [token, { residence, expiresAt }] of entries) {
    const li = document.createElement('li');
    const linkUrl = `${window.location.origin}/guestPage/guest.html?token=${token}`;

    const expireFormatted = new Date(expiresAt).toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    li.innerHTML = `
      <div class="link-url">${linkUrl}</div>
      <div class="expire-time">만료: ${expireFormatted}</div>
    `;

    const delBtn = document.createElement('button');
    delBtn.textContent = '삭제';
    delBtn.className = 'delete-btn';

    delBtn.onclick = async () => {
      const ok = confirm('이 링크를 삭제할까요?');
      if (ok) {
        await remove(ref(db, `guestLinks/${token}`));
        loadGuestLinks();
      }
    };

    li.appendChild(delBtn);
    listEl.appendChild(li);
  }
}

// 🔹 3. 이벤트 연결
document.getElementById('generate-link-btn').addEventListener('click', generateGuestLink);
loadGuestLinks();
