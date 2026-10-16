const user = sessionStorage.getItem("cs_user");
if (!user) location.href = "login.html";
const $ = (s) => document.querySelector(s);
const TIER = { hot: { c: 0.023, r: 0 }, warm: { c: 0.0125, r: 0.01 }, cold: { c: 0.004, r: 0.03 } };
const KEY = "cs_files";
const seed = [["sales_dashboard.xlsx","Document",0.2,40,0,"c"],["customer_db.csv","Document",1.5,18,1,"n"],["product_images.zip","Backup",3,2,25,"n"],["project_video_raw.mp4","Media",4.5,0,120,"n"],["db_backup_2025.zip","Backup",12,0,200,"n"],["meeting_notes.docx","Document",0.01,6,3,"n"],["old_reports.pdf","Document",0.4,1,70,"r"],["ml_dataset.tar.gz","Backup",30,0,60,"n"],["app_logs_q1.log","Backup",2,0,150,"r"],["invoice_2026.pdf","Document",0.05,12,0,"c"],["training_video.mp4","Media",6,1,45,"n"],["website_assets.zip","Backup",0.8,9,5,"n"]];
let files;
try { files = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
if (!files) files = seed.map((s) => ({ n: s[0], t: s[1], gb: s[2], acc: s[3], d: s[4], p: s[5] }));
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(files)); } catch (e) {} };
function score(f) {
  const mb = f.gb * 1024;
  const s = 0.2 * (1 - Math.min(1, Math.log10(1 + mb) / 3)) + 0.5 * Math.min(1, Math.log10(1 + f.acc) / 1.3) + 0.3 * Math.max(0, 1 - f.d / 90);
  const adj = { c: 0.3, n: 0, r: -0.3 }[f.p] + (f.t === "Backup" ? -0.15 : f.t === "Media" ? -0.05 : 0);
  return s + adj;
}
const tierOf = (l) => (l >= 0.6 ? "hot" : l >= 0.35 ? "warm" : "cold");
const money = (v) => "$" + v.toFixed(2);
const fmt = (g) => (g >= 1 ? g.toFixed(2) + " GB" : (g * 1024).toFixed(0) + " MB");
function render() {
  let used = 0, cost = 0, base = 0; const bySize = { hot: 0, warm: 0, cold: 0 };
  $("#tb").innerHTML = files.map((f, i) => {
    const l = score(f), t = tierOf(l); f.tier = t; used += f.gb; bySize[t] += f.gb;
    cost += f.gb * TIER[t].c + f.gb * TIER[t].r * f.acc; base += f.gb * TIER.hot.c;
    const rm = t === "hot" ? ["Good - Keep going", "ok"] : t === "warm" ? ["Balanced placement", "bl"] : ["Excellent - Low cost", "ok"];
    const flag = (t === "hot" && f.acc < 2) || (t === "cold" && f.acc > 10) ? ["Review placement", "or"] : rm;
    return "<tr><td>" + (i + 1) + "</td><td>" + f.n.replace(/[<>&]/g, "") + "</td><td>" + f.t + "</td><td>" + fmt(f.gb) + "</td><td>" + f.acc + "</td><td class='t-" + t + "'>" + t.toUpperCase() + "</td><td>" + l.toFixed(2) + "</td><td class='" + flag[1] + "'>" + flag[0] + "</td></tr>";
  }).join("");
  $("#used").textContent = used.toFixed(1) + " GB"; $("#cost").textContent = money(cost); $("#base").textContent = money(base);
  const sv = base ? (1 - cost / base) * 100 : 0; $("#sav").textContent = sv.toFixed(1) + "% saved";
  $("#bar").innerHTML = ["hot", "warm", "cold"].map((k) => "<i style='width:" + (bySize[k] / (used || 1)) * 100 + "%;background:var(--" + k + ")'></i>").join("");
  const low = files.map((f) => ({ f, l: score(f) })).sort((a, b) => a.l - b.l).slice(0, 4);
  $("#act").innerHTML = low.map((x, i) => "<tr><td>" + (i + 1) + "</td><td>" + x.f.n + "</td><td>" + (x.f.tier === "cold" ? "Keep in Cold" : "Move to " + (x.f.tier === "hot" ? "Warm" : "Cold")) + "</td></tr>").join("");
  $("#n1").textContent = files.filter((f) => f.tier === "cold").length + " files are currently in the Cold tier, saving you money";
}
const d = new Date();
$("#dd").textContent = d.getDate(); $("#dm").textContent = d.toLocaleString("en", { month: "short" }) + "-" + d.getFullYear();
$("#mon").textContent = "CURRENT BILLING MONTH " + d.toLocaleString("en", { month: "long" }).toUpperCase() + " " + d.getFullYear();
$("#un").textContent = user.toUpperCase() + " (USER)"; $("#av").textContent = user[0].toUpperCase();
$("#lo").onclick = (e) => { e.preventDefault(); sessionStorage.removeItem("cs_user"); location.href = "login.html"; };
$("#um").onclick = () => $("#lo").click();
$("#view").onclick = () => { $("#msg").textContent = "Action plan: move " + files.filter((f) => f.tier === "hot" && f.acc < 2).length + " rarely used Hot files to a cheaper tier and review Cold files that are accessed often."; };
$("#upb").onclick = () => $("#md").classList.add("on");
$("#cancel").onclick = () => $("#md").classList.remove("on");
$("#go").onclick = () => {
  const f = $("#fi").files[0]; if (!f) return;
  const e = (f.name.split(".").pop() || "").toLowerCase();
  const t = /^(zip|tar|gz|bak|7z|rar|log)$/.test(e) ? "Backup" : /^(mp4|mov|mkv|avi|mp3|wav)$/.test(e) ? "Media" : "Document";
  files.unshift({ n: f.name, t, gb: f.size / 2 ** 30, acc: 0, d: 0, p: $("#pr").value }); save(); render();
  $("#md").classList.remove("on"); $("#fi").value = "";
};
render();