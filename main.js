import './style.css'

let pdfIframe;
let sidebarOpened = false;

const getCurrentLocale = () => {
  const langCache = localStorage.getItem('langCache');
  if (langCache) return langCache;

  return navigator?.language || 'zh-CN';
};

/** 监听加载状态 */
const actionListenInit = (app) => {
  app.initializedPromise.then(() => {
    console.log('实例加载完成');
  })

  app.eventBus.on('documentloaded', (e) => {
    console.log('pdf 内容加载完成', e)
  })

  app.eventBus.on('pagerendered', (e) => {
    console.log(`第 ${e.pageNumber} 渲染完成`, e)
  })
}

/** 创建 pdf viewer */
const createPdfViewer = () => {
  sidebarOpened = false;
  if (pdfIframe) {
    pdfIframe.parentNode.removeChild(pdfIframe);
  }

  const iframe = document.createElement("iframe");
  iframe.src = `/pdfjs/web/viewer.html#locale=${getCurrentLocale()}`;

  iframe.onload = () => {
    const { PDFViewerApplication } = getViewerInstance();
    actionListenInit(PDFViewerApplication)
  };

  const container = document.querySelector('.pdf-container');
  container.appendChild(iframe);
  pdfIframe = iframe
}

/** 获取 pdf 实例 */
const getViewerInstance = () => {
  if (pdfIframe.contentWindow.document.readyState !== 'complete') {
    throw new Error('页面尚未加载完成');
  }
  const { PDFViewerApplication, PDFViewerApplicationOptions } = pdfIframe.contentWindow;
  return { PDFViewerApplication, PDFViewerApplicationOptions };
}

/** 展开 / 收起 pdf 侧边栏 */
const actionToggleSidebar = (visible) => {
  const { PDFViewerApplication } = getViewerInstance();
  if (visible) return PDFViewerApplication?.pdfSidebar?.open();
  else return PDFViewerApplication?.pdfSidebar?.close();
}

/** 切换文件 */
const actionSwitchFile = (src) => {
  pdfIframe.src = `/pdfjs/web/viewer.html?file=${encodeURIComponent(src)}`
}

/**
 * 跳转页码
 * 注意！页码是从 1 开始的
 */
const actionChangePage = (pageNumber) => {
  const { PDFViewerApplication } = getViewerInstance();
  PDFViewerApplication?.eventBus?.dispatch('pagenumberchanged', {
    value: pageNumber,
  });
}

/** 搜索指定内容 */
const actionSearch = (query) => {
  const { PDFViewerApplication } = getViewerInstance();
  PDFViewerApplication?.eventBus?.dispatch('find', {
    type: '',
    query,
    highlightAll: true,
  });
}

/** 切换缩放 */
const actionChangeScale = (scaleType) => {
  const { PDFViewerApplication } = getViewerInstance();
  PDFViewerApplication?.eventBus?.dispatch('scalechanged', {
    value: scaleType,
  });
}

/** 修改国际化，要先把 pdfBugEnabled 值改为 true */
const actionChangeLocale = (langCode) => {
  localStorage.setItem('langCache', langCode);
  location.reload()
}

const AnnotationEditorType = {
  DISABLE: -1,
  NONE: 0,
  FREETEXT: 3,
  HIGHLIGHT: 9,
  STAMP: 13,
  INK: 15
};

/** 切换为批注模式 */
const actionChangeAnnotation = (annotationType) => {
  const { PDFViewerApplication } = getViewerInstance();
  PDFViewerApplication?.eventBus?.dispatch('switchannotationeditormode', {
    mode: annotationType,
  });
}

const AnnotationEditorParamsType = {
  RESIZE: 1,
  CREATE: 2,
  FREETEXT_SIZE: 11,
  FREETEXT_COLOR: 12,
  FREETEXT_OPACITY: 13,
  INK_COLOR: 21,
  INK_THICKNESS: 22,
  INK_OPACITY: 23,
  HIGHLIGHT_COLOR: 31,
  HIGHLIGHT_DEFAULT_COLOR: 32,
  HIGHLIGHT_THICKNESS: 33,
  HIGHLIGHT_FREE: 34,
  HIGHLIGHT_SHOW_ALL: 35
};

/** 设置批注模式参数 */
const actionChangeAnnotationParam = (paramType, paramValue) => {
  const { PDFViewerApplication } = getViewerInstance();
  PDFViewerApplication?.eventBus?.dispatch('switchannotationeditorparams', {
    type: paramType,
    value: paramValue,
  });
}

/** 绑定按钮回调 */
const bindButton = (selector, callback) => {
  const btn = document.querySelector(selector);
  btn?.addEventListener('click', callback)
}

bindButton("#btnCreatePdfViewer", () => {
  createPdfViewer()
})

bindButton("#btnChangeFile", () => {
  actionSwitchFile('https://arxiv.org/pdf/2001.09977.pdf')
})

bindButton("#btnGetInstance", () => {
  const result = getViewerInstance()
  console.log('pdf 实例', result)
})

bindButton("#btnSidebarOpen", () => {
  actionToggleSidebar(true);
})

bindButton("#btnSidebarClose", () => {
  actionToggleSidebar(false);
})

bindButton("#btnJumpToPage3", () => {
  actionChangePage(3);
})

bindButton("#btnSearchContent", () => {
  actionSearch('match');
})

bindButton("#btnChangeToJa", () => {
  actionChangeLocale('ja-JP');
})

bindButton("#btnChangeToCn", () => {
  actionChangeLocale('zh-CN');
})

bindButton("#btnChangeScaleToPageWidth", () => {
  actionChangeScale('page-width');
})

bindButton("#btnChangeScaleTo300", () => {
  actionChangeScale('3');
})

bindButton("#btnChangeAnnotationText", () => {
  actionChangeAnnotation(AnnotationEditorType.FREETEXT);
})

bindButton("#btnChangeAnnotationInk", () => {
  actionChangeAnnotation(AnnotationEditorType.INK);
})

bindButton("#btnChangeAnnotationStamp", () => {
  actionChangeAnnotation(AnnotationEditorType.STAMP);
})

bindButton("#btnChangeAnnotationNone", () => {
  actionChangeAnnotation(AnnotationEditorType.NONE);
})

bindButton("#btnAddAnnotationStamp", () => {
  actionChangeAnnotationParam(AnnotationEditorParamsType.CREATE);
})

