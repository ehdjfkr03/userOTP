// Firebase DB 모듈 불러오기
import { db } from '../firebase-config.js';
import { ref, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// 📌 현재 한국(KST) 시간 반환 함수
function getKSTDate() {
  const utcNow = new Date(); // 현재 UTC 기준 시간
  // 'Asia/Seoul' 타임존으로 변환된 Date 객체 생성
  const kstNow = new Date(utcNow.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  return kstNow;
}

// 📌 임시 비밀번호 생성 및 저장 함수
function generatePassword() {
  // 세션 스토리지에서 임차인 고유 ID 및 거주지 정보 불러오기
  const tenantUid = sessionStorage.getItem('tenantUid');
  const residence = sessionStorage.getItem('residence');

  // 인증 정보가 없으면 종료
  if (!tenantUid || !residence) {
    alert('인증 정보가 없습니다.');
    return;
  }

  // 6자리 숫자로 임시 비밀번호 생성 (100000~999999)
  const password = Math.floor(100000 + Math.random() * 900000).toString();
  // 생성된 비밀번호를 HTML에 표시
  document.getElementById('generated-password').textContent = password;

  // 현재 KST 시간 가져오기
  const kstNow = getKSTDate();

  // 사용자가 입력한 유효 기간 정보(일/시/분) 가져오기
  const days = parseInt(document.getElementById('expire-days').value, 10) || 0;
  const hours = parseInt(document.getElementById('expire-hours').value, 10) || 0;
  const minutes = parseInt(document.getElementById('expire-minutes').value, 10) || 0;

  // 총 유효 시간(분 단위) 계산
  const totalMinutes = days * 1440 + hours * 60 + minutes;

  // 최소 1분, 최대 30일(43200분) 제한 체크
  if (totalMinutes < 1 || totalMinutes > 43200) {
    alert('최소 1분, 최대 30일 이내로 설정해주세요.');
    return;
  }

  // 만료 시간 계산 (현재 시간 + 총 유효시간)
  const expireDate = new Date(kstNow.getTime() + totalMinutes * 60 * 1000);

  // 만료 시간 포맷 (YYYY-MM-DDTHH:mm:ss 형식)
  const expiresAt = `${expireDate.getFullYear()}-${String(expireDate.getMonth() + 1).padStart(2, '0')}-${String(expireDate.getDate()).padStart(2, '0')}T${String(expireDate.getHours()).padStart(2, '0')}:${String(expireDate.getMinutes()).padStart(2, '0')}:${String(expireDate.getSeconds()).padStart(2, '0')}`;

  // 저장용 키: 생성 시간 기반 문자열 (예: 202505091645)
  const key = `${kstNow.getFullYear()}${String(kstNow.getMonth() + 1).padStart(2, '0')}${String(kstNow.getDate()).padStart(2, '0')}${String(kstNow.getHours()).padStart(2, '0')}${String(kstNow.getMinutes()).padStart(2, '0')}`;

  // Firebase 저장 경로 (예: tenants/abc123/generated/202505091645)
  const path = `tenants/${tenantUid}/generated/${key}`;

  // Firebase Realtime Database에 비밀번호 정보 저장
  update(ref(db), {
    [`${path}/guestPassword`]: password,  // 생성된 비밀번호
    [`${path}/expiresAt`]: expiresAt,     // 만료 시간
    [`${path}/residence`]: residence      // 거주지 정보
  })
    .then(() => {
      console.log('임시 비밀번호 저장 완료');

      // 클립보드에 비밀번호 복사
      navigator.clipboard.writeText(password)
        .then(() => {
          // 성공 시 이동 여부 확인
          const move = confirm('임시 비밀번호가 클립보드에 복사되었습니다.\n확인을 누르면 다음 페이지로 이동합니다.');
          if (move) {
            window.location.href = '../passwordList/lsit.html'; // 페이지 이동
          }
        })
        .catch(err => {
          console.error('클립보드 복사 실패:', err);
          alert('비밀번호는 생성되었지만 클립보드 복사에 실패했습니다.');
        });
    })
    .catch((error) => {
      console.error('저장 오류:', error);
      alert('비밀번호 저장 중 오류 발생');
    });
}

// 버튼 클릭 시 외부에서 호출 가능하도록 함수 바인딩
window.generatePassword = generatePassword;
