(function () {
  "use strict";

  // --- Login Functionality (simple/demo only) ---
  function setupLogin() {
    const loginSection = document.getElementById("login-section");
    const mainContent = document.getElementById("main-content");
    const loginForm = document.getElementById("loginForm");

    if (!loginSection || !mainContent || !loginForm) return;

    loginSection.style.display = "flex";
    mainContent.style.display = "none";

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

    
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!username || !password) {
        alert("لطفاً نام کاربری و رمز را وارد کنید.");
        return;
      }

      loginSection.style.display = "none";
      mainContent.style.display = "block";

      setTimeout(() => {
        loginSection.remove(); // 👈 
      }, 400);


      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // --- Helpers ---
  function qs(selector, parent = document) {
    return parent.querySelector(selector);
  }
  function qsa(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  }
  function isValidEmail(email) {
    // Simple, practical regex (covers common valid emails)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // --- Form handling ---
  function setupForm() {
    const form = qs("#cityForm");
    const thanksMessage = qs(".thanks-message");

    if (!form) return;

    let filePreviewContainer = qs("#filePreviewContainer");
    if (!filePreviewContainer) {
      filePreviewContainer = document.createElement("div");
      filePreviewContainer.id = "filePreviewContainer";
      filePreviewContainer.style.marginTop = "0.5rem";
      form.insertBefore(filePreviewContainer, form.querySelector("button[type='submit']"));
    }

    const nameInput = qs("#name", form);
    const emailInput = qs("#email", form);
    const cityInput = qs("#city", form);
    const reasonInput = qs("#reason", form);
    const storyInput = qs("#story", form);
    const photoInput = qs("#photo", form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const city = cityInput ? cityInput.value.trim() : "";
      const reason = reasonInput ? reasonInput.value.trim() : "";
      const story = storyInput ? storyInput.value.trim() : "";

      if (!name || !email || !city || !reason || !story) {
        alert("Please fill all required fields.");
        return;
      }
      if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        emailInput.focus();
        return;
      }

      const submission = {
        id: Date.now(),
        name,
        email,
        city,
        reason,
        story,
        fileName: photoInput && photoInput.files.length ? photoInput.files[0].name : null,
        createdAt: new Date().toISOString()
      };

      try {
        const key = "afghan_submissions_v1";
        const existing = JSON.parse(localStorage.getItem(key)) || [];
        existing.push(submission);
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (err) {
        console.warn("Could not save to localStorage:", err);
      }

      if (photoInput && photoInput.files.length) {
        const file = photoInput.files[0];
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = function (ev) {
            if (thanksMessage) {
              let img = qs(".submission-preview-img", thanksMessage);
              if (!img) {
                img = document.createElement("img");
                img.className = "submission-preview-img";
                img.style.maxWidth = "200px";
                img.style.display = "block";
                img.style.margin = "0.5rem auto";
                thanksMessage.appendChild(img);
              }
              img.src = ev.target.result;
              img.alt = submission.fileName || "Uploaded image";
            }
          };
          reader.readAsDataURL(file);
        }
      }

      if (form) form.style.display = "none";
      if (thanksMessage) {
        thanksMessage.style.display = "block";
        const note = document.createElement("p");
        note.textContent = `Thanks, ${name}! Your submission has been received.`;
        note.style.fontWeight = "700";
        thanksMessage.insertBefore(note, thanksMessage.firstChild);
      }

      setTimeout(function () {
        try {
          form.reset();
          if (form) form.style.display = "block";
          if (thanksMessage) {
            const firstP = qs(".thanks-message p");
            if (firstP && firstP.textContent.startsWith("Thanks,")) {
              firstP.remove();
            }
            const img = qs(".submission-preview-img", thanksMessage);
            if (img) img.remove();
            thanksMessage.style.display = "none";
          }
          filePreviewContainer.textContent = "";
        } catch (err) {
          console.warn("Reset error:", err);
        }
      }, 4500);
    });

    if (photoInput) {
      photoInput.addEventListener("change", function () {
        filePreviewContainer.innerHTML = "";
        if (!this.files || !this.files.length) return;
        const file = this.files[0];
        const nameEl = document.createElement("div");
        nameEl.textContent = "Selected file: " + file.name;
        nameEl.style.fontSize = "0.9rem";
        nameEl.style.marginBottom = "0.4rem";
        filePreviewContainer.appendChild(nameEl);

        if (file.type && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = function (ev) {
            const img = document.createElement("img");
            img.src = ev.target.result;
            img.alt = file.name;
            img.style.maxWidth = "120px";
            img.style.borderRadius = "8px";
            filePreviewContainer.appendChild(img);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  function setupSmoothScroll() {
    const anchors = qsa(".sidebar a[href^='#'], a[href^='#']");
    anchors.forEach(function (a) {
      a.addEventListener("click", function (ev) {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;
        ev.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function setupCardHover() {
    const cards = qsa(".city-card, .gallery-card");
    cards.forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        card.style.transform = "translateY(-8px) scale(1.02)";
        card.style.transition = "transform 260ms ease";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  function safeInitCarousel() {
    try {
      const carouselEl = document.getElementById("afghanCultureCarousel");
      if (!carouselEl) return;
      if (window.bootstrap && typeof window.bootstrap.Carousel === "function") {
        new window.bootstrap.Carousel(carouselEl, {
          interval: 3500,
          ride: "carousel",
          touch: true,
          pause: "hover"
        });
      }
    } catch (err) {
      console.warn("Carousel init error:", err);
    }
  }

  function setupSidebarKeyboardNav() {
    const links = qsa(".sidebar a");
    links.forEach(link => {
      link.setAttribute("tabindex", "0");
      link.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          link.click();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupLogin();        // ✅ Login setup
    setupForm();
    setupSmoothScroll();
    setupCardHover();
    safeInitCarousel();
    setupSidebarKeyboardNav();
  });
})();


document.addEventListener("DOMContentLoaded", function() {
  const typingElement = document.querySelector('.typing-text');
  const texts = [
    "Welcome to the Heart of Afghan Culture",
    "Discover the Richness of Afghan Traditions"
  ];
  const typingSpeed = 80;
  const displayTime = 2000;

  let textIndex = 0;
  let charIndex = 0;
  let typingForward = true;

  function typeLoop() {
    const currentText = texts[textIndex];

    if (typingForward) {
      typingElement.textContent = currentText.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentText.length) {
        typingForward = false;
        setTimeout(typeLoop, displayTime);
      } else {
        setTimeout(typeLoop, typingSpeed);
      }
    } else {
      typingElement.textContent = currentText.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        typingForward = true;
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(typeLoop, typingSpeed);
      } else {
        setTimeout(typeLoop, typingSpeed / 1.5);
      }
    }
  }

  typeLoop();
});


document.addEventListener("DOMContentLoaded", function() {
  const sidebar = document.getElementById("sidebar");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mainContent = document.querySelector(".main-content");

  hamburgerBtn.addEventListener("click", function() {
    sidebar.classList.toggle("show");
    mainContent.classList.toggle("shift");
  });


  const sidebarLinks = sidebar.querySelectorAll("a");
  sidebarLinks.forEach(link => {
    link.addEventListener("click", function() {
      sidebar.classList.remove("show");
      mainContent.classList.remove("shift");
    });
  });
});
