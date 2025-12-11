$(function() {
  try {
    const hasApp = !!window.App;
    const hasUI = hasApp && !!window.App.UI;
    
    if (!hasApp || !hasUI) {
      console.error('Core modules missing');
      return;
    }

    App.UI.init();
    
  } catch (e) {
    console.error('Initialization failed', e);
  }
});