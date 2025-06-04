document.getElementById("loginBtn").addEventListener("click", () => {
    //location.href = "/userOTP/signIn/signIn.html"; 
    location.href = "../signIn/signIn.html"; 
    // 로그인 페이지로 이동
    // html(화면 코드)에 id로 loginBtn 가진 버튼을 클릭하면 동작
    console.log("signIn 이동")
  });
  
  document.getElementById("signupBtn").addEventListener("click", () => {
    location.href = "/userOTP/signUp/signUp.html";
    // 회원가입 페이지로 이동
    console.log("signUp 이동")
  });
  