function getPrayerTimes(latitude, longitude) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const apiURL = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`;

  fetch(apiURL)
    .then(response => response.json())
    .then(data => {
      const timings = data.data.timings;

      // Startzeiten
      document.getElementById("fajr").textContent = timings.Fajr;
      document.getElementById("dhuhr").textContent = timings.Dhuhr;
      document.getElementById("asr").textContent = timings.Asr;
      document.getElementById("maghrib").textContent = timings.Maghrib;
      document.getElementById("isha").textContent = timings.Isha;

      // Endzeiten
      document.getElementById("fajrEnd").textContent = timings.Sunrise;
      document.getElementById("dhuhrEnd").textContent = timings.Asr;
      document.getElementById("asrEnd").textContent = timings.Maghrib;
      document.getElementById("maghribEnd").textContent = timings.Isha;
      document.getElementById("ishaEnd").textContent = "23:59"; // oder bis Fajr, je nach Region

      // Notifications + Sound
      scheduleAdhan(timings);
    })
    .catch(error => {
      console.error("Fehler beim Abrufen der Gebetszeiten:", error);
    });
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      document.getElementById("location").textContent = `Standort: ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      getPrayerTimes(lat, lon);
    }, () => {
      document.getElementById("location").textContent = "Standort konnte nicht ermittelt werden.";
    });
  } else {
    document.getElementById("location").textContent = "Geolocation wird nicht unterstützt.";
  }
}

// Darkmode
document.getElementById("toggle-darkmode").addEventListener("click", () => {
  document.body.classList.toggle("darkmode");
});

// Adhan + Notifications planen
function scheduleAdhan(timings) {
  const adhanAudio = document.getElementById("adhan-audio");
  const notificationPermission = Notification.permission;

  if (notificationPermission !== "granted") {
    Notification.requestPermission();
  }

  const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  prayerNames.forEach(name => {
    const timeParts = timings[name].split(":");
    const now = new Date();
    const prayerTime = new Date();
    prayerTime.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
prayerNames.forEach(name => {
  const timeParts = timings[name].split(":");
  const now = new Date();
  const prayerTime = new Date();
  prayerTime.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);

  if (prayerTime > now) {
    const timeout = prayerTime.getTime() - now.getTime();

    // Ersten kommenden Gebetszeitpunkt speichern
    if (!nextPrayerTime || prayerTime < nextPrayerTime) {
      nextPrayerTime = prayerTime;
    }

    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification(`Es ist Zeit für ${name}!`);
      }
      adhanAudio.play();
    }, timeout);
  }
});

    if (prayerTime > now) {
      const timeout = prayerTime.getTime() - now.getTime();
      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification(`Es ist Zeit für ${name}!`);
        }
        adhanAudio.play();
      }, timeout);
    }
  });
}
let nextPrayerTime;

document.getElementById("show-countdown").addEventListener("click", () => {
  if (nextPrayerTime) {
    startCountdown(nextPrayerTime);
  } else {
    document.getElementById("countdown").textContent = "Noch keine Gebetszeiten geladen.";
  }
});

function startCountdown(targetTime) {
  clearInterval(window.countdownInterval);
  window.countdownInterval = setInterval(() => {
    const now = new Date();
    const diff = targetTime - now;

    if (diff <= 0) {
      document.getElementById("countdown").textContent = "Jetzt ist Gebetszeit!";
      clearInterval(window.countdownInterval);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("countdown").textContent = `${hours}h ${minutes}m ${seconds}s`;
  }, 1000);
}

// alle 30 Minuten neu abrufen
setInterval(getLocation, 1800000);

// initial laden
getLocation();
