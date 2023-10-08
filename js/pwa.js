let deferredPrompt, enableDownload = false, installBtn;

window.addEventListener("load", () => {
    console.log("PWA ready!");
    let activeDownload = localStorage.getItem("PWA_installed");

    installBtn = document.querySelector("#pwa-install-btn");

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        console.log("Prepared");

        // Check installation
        if(!activeDownload){
            if (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches || window.navigator.standalone === true || localStorage.getItem('PWA_installed') === "true") {
                localStorage.setItem("PWA_installed", 'true');
                activeDownload = localStorage.getItem("PWA_installed");
            }
        }

        if(activeDownload || activeDownload == 'true') {
            enableDownload = true;

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
                installBtn.classList.remove("display");
            });
        } else {
            console.log('Installed before')
        }
    });

    window.addEventListener('appinstalled', (event) => {
        deferredPrompt = null;
        console.log('👍', 'appinstalled', event);
        localStorage.setItem("PWA_installed", 'true');
    });
});