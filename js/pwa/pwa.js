let deferredPrompt, enableDownload = false, installBtn, installRejector;

window.addEventListener("load", () => {
    console.log("PWA ready!");
    let activeDownload = localStorage.getItem("PWA_installed");
    let installDismissed = localStorage.getItem("installDismissed");
    installBtn = document.querySelector("#pwa-install-btn");
    installRejector = document.querySelector("#pwa-dismiss-btn"); //cool variable name
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        console.log("Prepared");

        // Check installation
        if(!activeDownload){
            // REMOVED: window.matchMedia('(display-mode: full-screen)').matches  ----> Full-screen doesn't that user has downloaded the PWA
            if (window.matchMedia('(display-mode: standalone)').matches  || window.navigator.standalone === true || localStorage.getItem('PWA_installed') === "true") {
                localStorage.setItem("PWA_installed", 'true');
                activeDownload = localStorage.getItem("PWA_installed");
            } else {
                localStorage.removeItem("PWA_installed");
                document.querySelector("#pwa-install").classList.remove("display");
                activeDownload = false;
            }
        }

        if((!activeDownload || activeDownload == 'false') && (!installDismissed || installDismissed == 'false')) {
            enableDownload = true;
            
            installRejector.addEventListener("click", ()=>{
                localStorage.setItem("installDismissed", 'true');
                document.querySelector("#pwa-install").classList.remove("display");
            });

            installBtn.addEventListener("click", () => {
                console.log("Installing...");
                // Show the install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                });

                enableDownload = false;
            });
        } else {
            console.log('Installed before or install dismissed')
        }
    });

    window.addEventListener('appinstalled', (event) => {
        deferredPrompt = null;
        console.log('👍', 'appinstalled', event);
        localStorage.setItem("PWA_installed", 'true');
    });
});