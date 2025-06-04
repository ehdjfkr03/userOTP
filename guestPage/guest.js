import { db } from '../firebase-config.js';
import { ref, get, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

async function loadGuestPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (!token) {
    document.body.textContent = '잘못된 링크입니다.';
    return;
  }

  const linkRef = ref(db, `guestLinks/${token}`);
  const snapshot = await get(linkRef);

  if (!snapshot.exists()) {
    document.body.textContent = '만료되었거나 유효하지 않은 링크입니다.';
    return;
  }

  const { residence, expiresAt } = snapshot.val();
  const now = new Date();
  if (new Date(expiresAt) < now) {
    await remove(linkRef); // 자동 삭제
    document.body.textContent = '링크가 만료되었습니다.';
    return;
  }

  document.getElementById('greeting').textContent = `${residence} 손님 안녕하세요`;

  document.getElementById('open-door-btn').addEventListener('click', async () => {
    try {
      const res = await fetch('https://your-arduino-endpoint.com/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (res.ok) {
        await remove(linkRef); // 🔸 링크 삭제
        alert('문이 열렸습니다. 링크는 이제 만료되었습니다.');
        // 선택적으로, 버튼 비활성화
        document.getElementById('open-door-btn').disabled = true;
        document.getElementById('open-door-btn').textContent = '문이 열렸습니다';
      } else {
        alert('문 열기 실패. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error(err);
      alert('요청 실패');
    }
  });
}

window.addEventListener('DOMContentLoaded', loadGuestPage);
