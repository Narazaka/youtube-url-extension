// @ts-check

/** @type {MutationObserver[]} */
const observers = [];

/** @type {MutationObserverInit} */
const mutationObserverInit = {
  childList: true,
  subtree: true,
};

/**
 * @typedef Options
 * @property {string} prefixUrl
 */

/** @type {Options} */
let options;

async function loadOptionsFirst() {
  options = await loadOptions();
}

function prefixUrl() {
  return options ? options.prefixUrl || "" : "";
}

/**
 *
 * @returns {Promise<Options>}
 */
async function loadOptions() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      {
        prefixUrl: "",
      },
      (optionsArg) => resolve(/** @type {Options} */ (optionsArg)),
    );
  });
}

/**
 * @param {string} url
 */
const toPlainUrl = (url) => {
  if (/watch\?v=/.test(url)) {
    return `https://www.youtube.com/watch?v=${new URL(url).searchParams.get(
      "v",
    )}`;
  }
  if (/youtu.be/.test(url)) {
    const idMatch = url.match(/\/youtu\.be\/([A-Za-z0-9_-]+)/);
    if (idMatch && idMatch[1])
      return `https://www.youtube.com/watch?v=${idMatch[1]}`;
  }
  if (/shorts/.test(url)) {
    const idMatch = url.match(/\/shorts\/([A-Za-z0-9_-]+)/);
    if (idMatch && idMatch[1])
      return `https://www.youtube.com/watch?v=${idMatch[1]}`;
  }
  if (!/^http/.test(url)) {
    return `https://www.youtube.com/watch?v=${url}`;
  }
  return url;
};

function createCompleteMessage() {
  const $div = document.createElement("div");
  $div.classList.add("youtube-url-extension");
  $div.classList.add("youtube-url-copy-complete");
  $div.textContent = "コピーしました";
  return $div;
}

function createMenuButton() {
  const $link = document.createElement("a");
  $link.target = "_blank";
  $link.rel = "noopener noreferrer";
  $link.classList.add("youtube-url-extension");
  $link.classList.add("youtube-url-button");
  $link.classList.add("youtube-url-video-button");
  $link.textContent = "Copy";
  return $link;
}

function createThumbnailButton() {
  const $link = document.createElement("a");
  $link.target = "_blank";
  $link.rel = "noopener noreferrer";
  $link.classList.add("youtube-url-extension");
  $link.classList.add("youtube-url-button");
  $link.classList.add("youtube-url-thumbnail-button");
  $link.textContent = "Copy";
  return $link;
}

function linkFromLocation() {
  return prefixUrl() + toPlainUrl(location.href);
}

/**
 *
 * @param {HTMLAnchorElement} $el
 */
function genLinkFromElement($el) {
  return () => prefixUrl() + toPlainUrl($el.href);
}

/**
 *
 * @param {Element} $parent
 * @param {string} selector
 * @param {(element: Element) => Element | null} getTarget
 * @param {() => HTMLAnchorElement} [createButton]
 * @param {boolean} [prepend]
 */
function createElementLinks(
  $parent,
  selector,
  getTarget,
  createButton = createThumbnailButton,
  prepend = true,
) {
  for (const $el of $parent.querySelectorAll(selector)) {
    const link = genLinkFromElement(/** @type {HTMLAnchorElement} */ ($el));
    const $target = getTarget($el);
    if (!$target) continue;
    const createLink = genCreateLink($target, createButton, link, prepend);
    const observer = new MutationObserver(createLink);
    observer.observe($el, mutationObserverInit);
    observers.push(observer);
    createLink();
  }
}

/**
 * @param {Element} $parent
 */
function genCreateLinks($parent) {
  return () => {
    // 動画ページ・ショートのメイン動画
    for (const $el of $parent.querySelectorAll("#actions")) {
      const createLink = genCreateLink($el, createMenuButton, linkFromLocation);
      const observer = new MutationObserver(createLink);
      observer.observe($el, mutationObserverInit);
      observers.push(observer);
      createLink();
    }
    // チャンネルタブ・履歴のショート
    createElementLinks(
      $parent,
      ".ytd-rich-grid-media .yt-simple-endpoint.ytd-thumbnail",
      ($el) => {
        if (!$el.parentElement) return null;
        if (!$el.parentElement.parentElement) return null;
        if (!$el.parentElement.parentElement.parentElement) return null;
        return $el.parentElement.parentElement.parentElement.querySelector("#details");
      },
    );
    // おすすめの動画・履歴の動画
    createElementLinks(
      $parent,
      ".yt-lockup-view-model .yt-lockup-view-model__content-image",
      ($el) => {
        if (!$el.parentElement) return null;
        return $el.parentElement.querySelector(".yt-lockup-metadata-view-model__text-container");
      }
    );
    // おすすめのショート
    createElementLinks(
      $parent,
      ".shortsLockupViewModelHost .shortsLockupViewModelHostEndpoint",
      ($el) => {
        if (!$el.parentElement) return null;
        return $el.parentElement.querySelector(".shortsLockupViewModelHostOutsideMetadata");
      }
    );
    // おすすめ・チャンネルタブのショート
    createElementLinks(
      $parent,
      ".ytd-rich-grid-slim-media .yt-simple-endpoint.ytd-thumbnail",
      ($el) => {
        if (!$el.parentElement) return null;
        if (!$el.parentElement.parentElement) return null;
        if (!$el.parentElement.parentElement.parentElement) return null;
        return $el.parentElement.parentElement.parentElement.querySelector("#details");
      },
    );
    // チャンネルホーム
    createElementLinks(
      $parent,
      ".ytd-grid-video-renderer .yt-simple-endpoint.ytd-thumbnail",
      ($el) => {
        if (!$el.parentElement) return null;
        if (!$el.parentElement.parentElement) return null;
        return $el.parentElement.parentElement.querySelector("#details");
      },
    );
    // チャンネルホーム
    createElementLinks(
      $parent,
      ".ytd-grid-playlist-renderer .yt-simple-endpoint.ytd-thumbnail",
      ($el) => {
        if (!$el.parentElement) return null;
        if (!$el.parentElement.parentElement) return null;
        return $el.parentElement.parentElement.querySelector("#details");
      },
    );
    // チャンネルホームのショート
    createElementLinks(
      $parent,
      ".ytd-reel-item-renderer .yt-simple-endpoint.ytd-thumbnail",
      ($el) => {
        if (!$el.parentElement) return null;
        if (!$el.parentElement.parentElement) return null;
        return $el.parentElement.parentElement.querySelector("#details");
      },
    );
    // 動画ページ横のオススメ欄
    createElementLinks(
      $parent,
      ".ytd-compact-video-renderer .yt-simple-endpoint.ytd-thumbnail",
      ($el) => {
        if (!$el.parentElement) return null;
        if (!$el.parentElement.parentElement) return null;
        return $el.parentElement.parentElement.querySelector(".details");
      },
    );
    createElementLinks(
      $parent,
      ".ytd-video-renderer .yt-simple-endpoint.ytd-thumbnail",
      ($el) => {
        if (!$el.parentElement) return null;
        if (!$el.parentElement.parentElement) return null;
        return $el.parentElement.parentElement.querySelector(".text-wrapper");
      },
    );
    // プレイリスト
    createElementLinks(
      $parent,
      ".ytd-playlist-video-renderer .yt-simple-endpoint.ytd-thumbnail",
      ($el) => {
        if (!$el.parentElement) return null;
        if (!$el.parentElement.parentElement) return null;
        const meta = $el.parentElement.parentElement.querySelector("#meta");
        /** @type {HTMLElement} */ (meta).style.position = "relative";
        return meta;
      },
    );
    // プレイリスト動画ページのプレイリスト動画一覧
    createElementLinks(
      $parent,
      ".ytd-playlist-panel-video-renderer .yt-simple-endpoint.ytd-thumbnail",
      ($el) => {
        if (!$el.parentElement) return null;
        if (!$el.parentElement.parentElement) return null;
        if (!$el.parentElement.parentElement.parentElement) return null;
        if (!$el.parentElement.parentElement.parentElement.parentElement)
          return null;
        if (
          !$el.parentElement.parentElement.parentElement.parentElement
            .parentElement
        )
          return null;
        if (
          !$el.parentElement.parentElement.parentElement.parentElement
            .parentElement.parentElement
        )
          return null;
        const meta =
          $el.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector(
            "#menu",
          );
        return meta;
      },
      createMenuButton,
      false,
    );
  };
}

/**
 * @param {Element} $parent
 * @param {() => HTMLAnchorElement} createButton
 * @param {() => string} generateLink
 */
function genCreateLink($parent, createButton, generateLink, prepend = true) {
  return () => {
    const href = generateLink();
    const $previousLink = /** @type {HTMLAnchorElement} */ (
      $parent.querySelector(".youtube-url-button")
    );
    if ($previousLink) {
      $previousLink.onclick = genCopyLink($previousLink, href);
      return;
    }
    const $link = createButton();
    $link.onclick = genCopyLink($link, href);
    if (prepend) {
      $parent.prepend($link);
    } else {
      $parent.append($link);
    }
  };
}

/**
 *
 * @param {HTMLAnchorElement} $parent
 * @param {string} href
 * @returns
 */
function genCopyLink($parent, href) {
  return () => {
    copyToClipboard(href);
    const $message = createCompleteMessage();
    $parent.appendChild($message);
    setTimeout(() => {
      $parent.removeChild($message);
    }, 2500);
  };
}

/**
 * @param {string} str
 */
function copyToClipboard(str) {
  const $textArea = document.createElement("textarea");
  $textArea.style.position = "absolute";
  $textArea.style.left = "-100%";
  $textArea.value = str;
  document.body.appendChild($textArea);
  $textArea.select();
  document.execCommand("copy");
  document.body.removeChild($textArea);
}

/**
 *
 * @param {number} ms
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await loadOptionsFirst();
  /** @type {Element | null} */
  let element = null;
  let index = 0;
  while (index < 60) {
    await wait(1000);
    element = /** @type {Element} */ (document.querySelector("#page-manager"));
    if (element) break;
    index++;
  }
  if (!element) return; // elementが1分経っても見つからなければexit

  const createLinks = genCreateLinks(element);
  const observer = new MutationObserver(createLinks);
  observer.observe(element, mutationObserverInit);
  observers.push(observer);

  createLinks();
}

main();
