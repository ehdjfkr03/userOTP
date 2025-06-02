import { db } from '../firebase-config.js';
import { ref, get, set, child, push, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const authPopup = document.getElementById('authPopup');
const openAuthPopup = document.getElementById('openAuthPopup');
const closePopup = document.getElementById('closePopup');
const authConfirm = document.getElementById('authConfirm');
const registerBtn = document.getElementById('registerBtn');
// 4 ~ 8번 줄은 signup.html에 있는 요소들의 정보 저장 


let verifiedResidence = null;
let verifiedCode = null;
let ownerKey = null;

openAuthPopup.addEventListener('click', () => {
  authPopup.style.display = 'flex';
  // 팝업(인증 화면) 열기 
});

closePopup.addEventListener('click', () => {
  authPopup.style.display = 'none';
  // 팝업(인증 화면) 닫기 
});

authConfirm.addEventListener('click', async () => {
  const type = document.getElementById('type').value; // 주거 타입 
  const dong = document.getElementById('dong').value; // 동
  const ho = document.getElementById('ho').value; // 호
  const code = document.getElementById('code').value;// 인증 코드 
  const ownerId = document.getElementById('id').value;// 집주인 id 

  const residenceKey = `${type}-${dong}동-${ho}호`;

  const snapshot = await get(child(ref(db), 'users'));
  const users = snapshot.val(); 
  // 파이어베이스에서 users 정보 받아옴

  let isValid = false;
  for (const key in users) {
    const user = users[key];
    const houses = user.houses || {};

    if (user.id === ownerId && houses[residenceKey] && houses[residenceKey].code === code) {
      isValid = true; // true 인증 성공, false 인증 실패 
      ownerKey = key; // 소유자 위치 기억
      break;
    }
  }
  // users에 있는 정보와 입력한 값이 일치하는지 반복문을 통해 비교 

  if (isValid) { // 인증 성공 
    alert('인증 성공!');
    authPopup.style.display = 'none'; // 팝업 닫기 
    verifiedResidence = residenceKey;
    verifiedCode = code;
    registerBtn.disabled = false;
  } else {
    alert('인증 실패. 정보를 다시 확인해주세요.');
  }
});

registerBtn.addEventListener('click', async () => {
  const id = document.getElementById('tenantId').value;
  // id 받아옴
  const password = document.getElementById('tenantPassword').value;
  // password 받아옴 

  if (!id || !password || !verifiedResidence || !verifiedCode || ownerKey === null) {
    alert('모든 항목을 입력하고 인증을 완료해주세요.');
    return;
  } // 인증이 진행되었는지 확인 

  // 1. 입주자 등록
  const newTenantRef = push(ref(db, 'tenants'));
  await set(newTenantRef, {
    id,
    password,
    residence: verifiedResidence,
    tempCodes: {}
  });
  // 파이어베이스에 입주자 저장

  // 2. 인증 성공 시 인증 코드 삭제 (houses[residenceKey] 제거)
  const housePath = `users/${ownerKey}/houses/${verifiedResidence}`;
  await set(ref(db, housePath), null);

  alert('회원가입이 완료되었습니다.');
  window.location.href = "../main/index.html";
  // 처음 화면으로 이동 
});
