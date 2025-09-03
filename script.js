// JS: seleciona elementos
const studentsPanel = document.getElementById("studentsPanel");
const studentsInput = document.getElementById("studentsInput");
const addStudentsBtn = document.getElementById("addStudents");
const studentsMsg = document.getElementById("studentsMsg");

// Mostra painel só pra ADMIN/ADMINMASTER
function showLogged(username, role){
  loginDiv.style.display = "none";
  loggedDiv.style.display = "block";
  welcome.textContent = `Logado como: ${username} (${role})`;
  if(role === "ADMINMASTER" || role === "ADMIN") {
    adminPanel.style.display = "block";
    studentsPanel.style.display = "block";
  }
  localStorage.setItem("loggedAs", username);
  localStorage.setItem("loggedRole", role);
}

// Botão adicionar alunos
addStudentsBtn.addEventListener("click", async ()=>{
  const creator = localStorage.getItem("loggedAs");
  const names = studentsInput.value.split("\n").map(n=>n.trim()).filter(n=>n!=="");

  if(names.length === 0){
    studentsMsg.textContent = "Digite pelo menos um nome!";
    return;
  }

  const { data, error } = await supabase.rpc("add_students", { p_creator: creator, p_names: names });
  if(error) studentsMsg.textContent = "Erro: "+error.message;
  else if(data && data.length>0) studentsMsg.textContent = data[0].msg;

  studentsInput.value = "";
});
