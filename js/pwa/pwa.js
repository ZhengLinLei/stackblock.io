let deferredPrompt, enableDownload = false, installBtn, installRejector;

// Check environment
function checkEnvironment() {
    let active;
    if (window.matchMedia('(display-mode: standalone)').matches  || window.navigator.standalone === true || localStorage.getItem('PWA_installed') === "true") {
        localStorage.setItem("PWA_installed", 'true');
        active = localStorage.getItem("PWA_installed");
    } else {
        localStorage.removeItem("PWA_installed");
        document.querySelector("#pwa-install").classList.remove("display");
        active= false;
    }

    return active;
}

window.addEventListener("load", () => {
    console.log("PWA ready!");
    let activeDownload = localStorage.getItem("PWA_installed");
    let installDismissed = localStorage.getItem("installDismissed");
    installBtn = document.querySelector("#pwa-install-btn");
    installRejector = document.querySelector("#pwa-dismiss-btn"); //cool variable name
    installRejector.addEventListener("click", ()=>{
        localStorage.setItem("installDismissed", 'true');
        document.querySelector("#pwa-install").classList.remove("display");
    });

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        console.log("Prepared");

        // Check installation
        if(!activeDownload)
            activeDownload = checkEnvironment();

        if((!activeDownload || activeDownload == 'false') && (!installDismissed || installDismissed == 'false')) {
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
            });
        } else {
            console.log('Installed before or install dismissed')
        }
    });

    // IOS
    if(navigator.userAgent.match(/(iPad|iPhone|iPod)/g) && navigator.userAgent.match(/(Safari)/g)) {
        // Set to true to force download
        enableDownload = true;
        // Check other conditions
        enableDownload = !checkEnvironment();
    }

    window.addEventListener('appinstalled', (event) => {
        deferredPrompt = null;
        console.log('👍', 'appinstalled', event);
        localStorage.setItem("PWA_installed", 'true');
    });
});