import { createClient } from "https://esm.sh/@supabase/supabase-js";

// ======================================
// SUPABASE
// ======================================

const supabase = createClient(
    "https://pqdiarutkhlttjjfqmfr.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZGlhcnV0a2hsdHRqamZxbWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NzUzNjUsImV4cCI6MjA5NzU1MTM2NX0.0-d5brTftOq2abTLHnIwrLx4RSD_J3P4vuKpNa6Vvso"
);

// ======================================
// ELEMENTS
// ======================================

const gallery = document.getElementById("gallery");

const uploadBtn =
    document.getElementById("uploadBtn") ||
    document.getElementById("uploadbtn");

const imageInput =
    document.getElementById("imageInput") ||
    document.getElementById("fileInput");

const loader = document.getElementById("loader");

const loginModal =
    document.getElementById("loginModal");

const studentAccess =
    document.getElementById("studentAccess");

const loginBtn =
    document.getElementById("loginBtn");

const passwordInput =
    document.getElementById("passwordInput");

const closeLogin =
    document.getElementById("closeLogin");

const viewer =
    document.getElementById("imageViewer");

const viewerImage =
    document.getElementById("viewerImage");

const closeViewer =
    document.getElementById("closeViewer");

// ======================================
// ADMIN
// ======================================

let isAdmin = false;

if (uploadBtn) {

    uploadBtn.style.display = "none";

}

// ======================================
// LOADING SCREEN
// ======================================

window.addEventListener("load", () => {

    if (!loader) return;

    setTimeout(() => {

        loader.style.opacity = "0";

        setTimeout(() => {

            loader.style.display = "none";

        }, 600);

    }, 1000);

});

// ======================================
// LOGIN POPUP
// ======================================

if (studentAccess) {

    studentAccess.onclick = (e) => {

        e.preventDefault();

        loginModal.style.display = "flex";

    };

}

if (closeLogin) {

    closeLogin.onclick = () => {

        loginModal.style.display = "none";

    };

}

window.onclick = (e) => {

    if (e.target === loginModal) {

        loginModal.style.display = "none";

    }

};

// ======================================
// LOGIN
// ======================================

if (loginBtn) {

    loginBtn.onclick = () => {

        const password =
            passwordInput.value.trim();

        if (password === "jss3") {

            isAdmin = true;

            loginModal.style.display = "none";

            passwordInput.value = "";

            if (uploadBtn) {

                uploadBtn.style.display = "inline-block";

            }

            if (studentAccess) {

                studentAccess.style.display = "none";

            }

            loadGallery();

        }

        else {

            alert("Wrong Password");

        }

    };

}

// ======================================
// IMAGE VIEWER
// ======================================

function openViewer(imageURL) {

    if (!viewer) return;

    viewer.style.display = "flex";

    viewerImage.src = imageURL;

}

function closeImageViewer() {

    if (!viewer) return;

    viewer.style.display = "none";

}

if (closeViewer) {

    closeViewer.onclick = closeImageViewer;

}

if (viewer) {

    viewer.onclick = (e) => {

        if (e.target === viewer) {

            closeImageViewer();

        }

    };

}

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        closeImageViewer();

    }

});

// ======================================
// LOAD GALLERY
// ======================================

async function loadGallery() {

    if (!gallery) return;

    gallery.innerHTML = "";

    const { data, error } =
        await supabase.storage
            .from("gallery")
            .list("", {

                sortBy: {

                    column: "name",

                    order: "desc"

                }

            });

    if (error) {

        console.error(error);

        return;

    }

    for (const file of data) {

        const { data: publicData } =
            supabase.storage
                .from("gallery")
                .getPublicUrl(file.name);

        createCard(
            publicData.publicUrl,
            file.name
        );

    }

}

// ======================================
// CREATE PHOTO CARD
// ======================================

function createCard(imageURL, fileName) {

    const card = document.createElement("div");
    card.className = "photo-card";

    const img = document.createElement("img");
    img.src = imageURL;
    img.alt = fileName;
    img.style.cursor = "pointer";

    img.addEventListener("click", () => {
        openViewer(imageURL);
    });

    card.appendChild(img);

    // ==========================
    // DOWNLOAD BUTTON
    // ==========================

    const downloadBtn = document.createElement("button");

    downloadBtn.className = "download-btn";

    downloadBtn.innerHTML =
        '<i class="fa-solid fa-download"></i>';

    downloadBtn.addEventListener("click", async () => {

        try {

            const response = await fetch(imageURL);

            const blob = await response.blob();

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;
            a.download = fileName;

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            URL.revokeObjectURL(url);

        } catch (err) {

            console.error(err);

            alert("Download failed.");

        }

    });

    card.appendChild(downloadBtn);

    // ==========================
    // DELETE BUTTON
    // ==========================

    if (isAdmin) {

        const deleteBtn =
            document.createElement("button");

        deleteBtn.className = "delete-btn";

        deleteBtn.innerHTML =
            '<i class="fa-solid fa-trash"></i>';

        deleteBtn.addEventListener("click", async () => {

            const sure = confirm(
                "Delete this image?"
            );

            if (!sure) return;

            const { error } =
                await supabase.storage
                    .from("gallery")
                    .remove([fileName]);

            if (error) {

                console.error(error);

                alert("Delete failed.");

                return;

            }

            loadGallery();

        });

        card.appendChild(deleteBtn);

    }

    gallery.appendChild(card);

}

// ======================================
// UPLOAD IMAGES
// ======================================

if (uploadBtn && imageInput) {

    uploadBtn.addEventListener("click", () => {

        imageInput.click();

    });

    imageInput.addEventListener("change", async () => {

        const files = imageInput.files;

        if (!files.length) return;

        uploadBtn.disabled = true;

        uploadBtn.textContent = "Uploading...";

        for (const file of files) {

            const fileName =
                Date.now() + "-" + file.name;

            const { error } =
                await supabase.storage
                    .from("gallery")
                    .upload(fileName, file);

            if (error) {

                console.error(error);

                alert("Upload failed.");

            }

        }

        imageInput.value = "";

        await loadGallery();

        uploadBtn.disabled = false;

        uploadBtn.textContent = "Upload Photos";

    });

}

// ======================================
// LOGOUT WHEN PAGE CLOSES
// ======================================

window.addEventListener("beforeunload", () => {

    isAdmin = false;

});

// ======================================
// START
// ======================================

loadGallery();
