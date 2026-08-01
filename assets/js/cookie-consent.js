(function () {
  "use strict";

  var STORAGE_KEY = "gabrieleCompagniAnalyticsConsent";
  var MEASUREMENT_ID = "G-2DK671R9LE";
  var ANALYTICS_SCRIPT_ID = "gabriele-compagni-ga4";
  var analyticsLoaded = false;

  function readChoice() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return value === "accepted" || value === "rejected" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function saveChoice(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      return;
    }
  }

  function disableAnalytics() {
    window["ga-disable-" + MEASUREMENT_ID] = true;
  }

  function expireCookie(name, domain) {
    var cookie = name + "=; Max-Age=0; Path=/; SameSite=Lax";
    if (domain) cookie += "; Domain=" + domain;
    document.cookie = cookie;
  }

  function deleteAnalyticsCookies() {
    var hostname = window.location.hostname;
    var cookieNames = document.cookie.split(";").map(function (cookie) {
      return cookie.trim().split("=")[0];
    }).filter(function (name) {
      return /^_ga(?:_|$)/.test(name);
    });

    cookieNames.forEach(function (name) {
      expireCookie(name);
      if (hostname) {
        expireCookie(name, hostname);
        expireCookie(name, "." + hostname);
      }
      if (hostname === "gabrielecompagni.com" || hostname.endsWith(".gabrielecompagni.com")) {
        expireCookie(name, ".gabrielecompagni.com");
      }
    });
  }

  function loadAnalytics() {
    if (analyticsLoaded || document.getElementById(ANALYTICS_SCRIPT_ID)) return;

    analyticsLoaded = true;
    window["ga-disable-" + MEASUREMENT_ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, { send_page_view: false });
    window.gtag("event", "page_view");

    var script = document.createElement("script");
    script.id = ANALYTICS_SCRIPT_ID;
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);
  }

  var banner = document.createElement("aside");
  banner.className = "cookie-consent";
  banner.setAttribute("aria-label", "Analytics cookie consent");
  banner.hidden = true;
  banner.innerHTML =
    '<p>This website uses optional analytics cookies to understand how visitors use the site.</p>' +
    '<div class="cookie-consent__actions">' +
      '<button type="button" data-cookie-choice="accepted">Accept</button>' +
      '<button type="button" data-cookie-choice="rejected">Reject</button>' +
      '<a href="/cookie-policy.html">Cookie policy</a>' +
    '</div>';

  var settings = document.createElement("button");
  settings.type = "button";
  settings.className = "cookie-settings";
  settings.textContent = "Cookie settings";
  settings.hidden = true;

  function openBanner() {
    banner.hidden = false;
    settings.hidden = true;
  }

  function closeBanner() {
    banner.hidden = true;
    settings.hidden = false;
  }

  banner.addEventListener("click", function (event) {
    var button = event.target.closest("[data-cookie-choice]");
    if (!button) return;

    var choice = button.getAttribute("data-cookie-choice");
    var wasAccepted = readChoice() === "accepted" || analyticsLoaded;
    saveChoice(choice);
    closeBanner();

    if (choice === "accepted") {
      loadAnalytics();
      return;
    }

    disableAnalytics();
    deleteAnalyticsCookies();
    if (wasAccepted) window.location.reload();
  });

  settings.addEventListener("click", openBanner);

  document.body.appendChild(banner);
  document.body.appendChild(settings);

  var savedChoice = readChoice();
  if (savedChoice === "accepted") {
    closeBanner();
    loadAnalytics();
  } else if (savedChoice === "rejected") {
    disableAnalytics();
    deleteAnalyticsCookies();
    closeBanner();
  } else {
    disableAnalytics();
    openBanner();
  }
})();
