// Firebase Realtime Database 관련 함수 불러오기
import { db } from "../firebase-config.js";
import { ref, get, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// 📌 임시 비밀번호 목록을 불러오는 메인 함수
async function loadCodeList() {
  // 세션에서 로그인된 사용자(임차인)의 UID 가져오기
  const tenantUid = sessionStorage.getItem('tenantUid');
  if (!tenantUid) {
    alert('로그인 정보가 없습니다.');
    return;
  }

  // 현재 사용자의 임시 비밀번호 저장 경로 참조
  const generatedRef = ref(db, `tenants/${tenantUid}/generated`);
  // 비밀번호 목록이 렌더링될 HTML 요소
  const container = document.getElementById('code-list-container');

  try {
    // 비밀번호 데이터 불러오기
    const snapshot = await get(generatedRef);
    container.innerHTML = ''; // 기존 리스트 초기화

    // 데이터가 존재하는 경우
    if (snapshot.exists()) {
      const codes = snapshot.val();
      const now = new Date(); // 현재 시각

      // 생성된 항목들을 최신순(key 기준)으로 정렬
      const sortedEntries = Object.entries(codes).sort(([a], [b]) => b.localeCompare(a));

      // 각 항목을 반복 처리
      for (const [key, { guestPassword, expiresAt, residence }] of sortedEntries) {
        // 만료 시간을 Date 객체로 파싱 (KST 기준)
        const expireDate = parseKstStringToDate(expiresAt);

        // 이미 만료된 경우 삭제
        if (expireDate < now) {
          await remove(ref(db, `tenants/${tenantUid}/generated/${key}`));
          continue;
        }

        // 생성 시간은 key 문자열을 기반으로 파싱 (예: 202505091645 → 2025-05-09T16:45)
        const year = key.slice(0, 4);
        const month = key.slice(4, 6);
        const day = key.slice(6, 8);
        const hour = key.slice(8, 10);
        const minute = key.slice(10, 12);
        const createdAt = new Date(`${year}-${month}-${day}T${hour}:${minute}:00+09:00`);

        // 생성 시간 형식 (한국어, 12시간제)
        const createdAtFormatted = createdAt.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Seoul'
        });

        // 만료 시간 형식 
        const expireTime = expireDate.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Seoul'
        });

        // 📌 HTML에 비밀번호 항목(li) 추가
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>생성 시간:</strong> ${createdAtFormatted}<br/>
          <strong>임시 비밀번호:</strong> ${guestPassword}<br/>
          <strong>만료 시각:</strong> ${expireTime}<br/>
          <strong>거주지:</strong> ${residence}<br/>
        `;

        // 🗑 삭제 버튼 UI 구성
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '삭제';
        deleteBtn.style.marginTop = '4px';
        deleteBtn.style.backgroundColor = '#e74c3c';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.padding = '4px 8px';
        deleteBtn.style.borderRadius = '4px';
        deleteBtn.style.cursor = 'pointer';

        // 삭제 버튼 클릭 시 삭제 처리
        deleteBtn.addEventListener('click', async () => {
          const confirmDelete = confirm('이 인증 코드를 삭제하시겠습니까?');
          if (confirmDelete) {
            try {
              // Firebase에서 항목 삭제
              await remove(ref(db, `tenants/${tenantUid}/generated/${key}`));
              alert('삭제 완료되었습니다.');
              loadCodeList(); // 삭제 후 목록 다시 불러오기
            } catch (err) {
              console.error('삭제 오류:', err);
              alert('삭제 중 오류가 발생했습니다.');
            }
          }
        });

        // 항목(li)에 삭제 버튼 붙이고 리스트에 추가
        li.appendChild(deleteBtn);
        container.appendChild(li);
      }

    } else {
      // 항목이 없을 경우 메시지 출력
      container.innerHTML = '<li>생성된 인증코드가 없습니다.</li>';
    }
  } catch (err) {
    console.error('코드 목록 로딩 오류:', err);
    alert('데이터를 불러오는 중 오류가 발생했습니다.');
  }
}

// 📌 KST(한국 시간) 문자열을 Date 객체로 변환하는 함수
function parseKstStringToDate(kstString) {
  // Firebase에 저장된 문자열은 시간대 정보가 없기 때문에 '+09:00'을 붙여 한국 시간으로 해석
  return new Date(kstString + '+09:00');
}

// 📌 페이지가 로드되면 실행되는 초기화 코드
window.addEventListener('DOMContentLoaded', () => {
  // "비밀번호 생성하러 가기" 버튼 클릭 시 페이지 이동
  document.getElementById('go-generate').addEventListener('click', () => {
    window.location.href = '../createPassword/password.html';
  });

  // 비밀번호 목록 로딩 시작
  loadCodeList();
});
