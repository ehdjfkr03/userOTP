import { db } from '../firebase-config.js';
import { ref, get, child } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

window.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('authBtn');
  // 로그인 버튼(authBtn)
  loginBtn.addEventListener('click', async () => {
    const inputId = document.getElementById('tenantId').value.trim();
    // id 값 받아옴 
    const inputPw = document.getElementById('tenantPassword').value.trim();
    // password 값 받아옴
    if (!inputId || !inputPw) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const snapshot = await get(child(ref(db), 'tenants'));
      // 파이어베이스에서 tenants 항목의 정보 받아옴 
      const tenants = snapshot.val();

      let matchedTenant = null;
      let matchedUid = null;

      for (const key in tenants) {
        const tenant = tenants[key];
        if (tenant.id === inputId && tenant.password === inputPw) {
          matchedTenant = tenant;
          matchedUid = key;
          break;
        }
        // 반복문을 통해 입력한 id, password와 tenants 항목에 있는 데이터가 일치하는게 있는지 확인 
      }

      if (matchedTenant) {
        // 로그인 성공: 세션에 정보 저장 - 다른 화면에서 로그인 정보를 사용하기 위해서 
        sessionStorage.setItem('tenantUid', matchedUid); 
        sessionStorage.setItem('tenantId', matchedTenant.id);
        sessionStorage.setItem('residence', matchedTenant.residence);
        sessionStorage.setItem('mainCode', matchedTenant.mainCode);

        //window.location.href = '../passwordList/lsit.html';
        // 비밀번호 리스트 화면으로 이동 

        window.location.href = '../linkList/guestLink.html';
      } else {
        alert('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  });
});
