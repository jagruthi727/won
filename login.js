let code = "";
function drawCaptcha() {
  const cv = document.getElementById("cv"), x = cv.getContext("2d"), chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  x.clearRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < 6; i++) { x.strokeStyle = "rgba(120,130,150,.5)"; x.beginPath(); x.moveTo(Math.random() * 280, Math.random() * 62); x.lineTo(Math.random() * 280, Math.random() * 62); x.stroke(); }
  x.font = "bold 36px Arial"; x.textBaseline = "middle";
  [...code].forEach((ch, i) => { x.save(); x.translate(20 + i * 42, 32); x.rotate((Math.random() - .5) * .5); x.fillStyle = "#a01515"; x.fillText(ch, 0, 0); x.restore(); });
}
drawCaptcha();
document.getElementById("rf").onclick = drawCaptcha;
document.getElementById("eye").onclick = () => { const p = document.getElementById("p"); p.type = p.type === "password" ? "text" : "password"; };
document.getElementById("f").onsubmit = (ev) => {
  ev.preventDefault();
  const u = document.getElementById("u").value.trim(), p = document.getElementById("p").value, c = document.getElementById("c").value.trim(), e = document.getElementById("e");
  if (u.length < 3 || p.length < 4) { e.textContent = "Enter a username (3+ chars) and password (4+ chars)."; return; }
  if (c.toUpperCase() !== code) { e.textContent = "Captcha does not match. Try again."; drawCaptcha(); document.getElementById("c").value = ""; return; }
  sessionStorage.setItem("cs_user", u);
  location.href = "dashboard.html";
};
