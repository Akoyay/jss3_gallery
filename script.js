import { createClient } from "https://esm.sh/@supabase/supabase-js";

// ==========================
// SUPABASE
// ==========================

const supabase = createClient(
  "https://pqdiarutkhlttjjfqmfr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZGlhcnV0a2hsdHRqamZxbWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NzUzNjUsImV4cCI6MjA5NzU1MTM2NX0.0-d5brTftOq2abTLHnIwrLx4RSD_J3P4vuKpNa6Vvso"
);

// ==========================
// ACCESS CONTROL
// ==========================

window.studentAccess = function () {

  const password = prompt("Enter student password");

  if (password === "jss3gallery") {

    localStorage.setItem("isAdmin", "true");

    window.location.href = "gallery.html";

  } else {

    alert("Wrong password");

  }

};

window.guestAccess = function () {

  localStorage.setItem("isAdmin", "false");

  window.location.href = "gallery.html";

};

globalThis.studentAccess = window.studentAccess;
globalThis.guestAccess = window.guestAccess;

// ==========================
// GALLERY PAGE
// ==========================

if (window.location.pathname.includes("gallery.html")) {

  const isAdmin =
    localStorage.getItem("isAdmin") === "true";

  const uploadBtn =
    document.getElementById("uploadBtn");

  const imageInput =
    document.getElementById("imageInput");

  const gallery =
    document.getElementById("gallery");

  // Hide upload button for guests
  if (uploadBtn && !isAdmin) {

    uploadBtn.style.display = "none";

  }

  // ==========================
  // CREATE CARD
  // ==========================

  function createCard(imageURL, fileName) {

    const card =
      document.createElement("div");

    card.classList.add("photo-card");

    // IMAGE
    const img =
      document.createElement("img");

    img.src = imageURL;

    // DOWNLOAD BUTTON
    const downloadBtn =
      document.createElement("button");

    downloadBtn.innerHTML = "⬇";

    downloadBtn.classList.add("download-btn");

    downloadBtn.addEventListener(
      "click",
      async () => {

        try {

          const response =
            await fetch(imageURL);

          const blob =
            await response.blob();

          const url =
            URL.createObjectURL(blob);

          const a =
            document.createElement("a");

          a.href = url;

          a.download = fileName;

          document.body.appendChild(a);

          a.click();

          document.body.removeChild(a);

          URL.revokeObjectURL(url);

        } catch (err) {

          console.error(err);

        }

      }
    );

    card.appendChild(img);
    card.appendChild(downloadBtn);

    // DELETE BUTTON
    if (isAdmin) {

      const deleteBtn =
        document.createElement("button");

      deleteBtn.innerHTML = "✖";

      deleteBtn.classList.add("delete-btn");

      deleteBtn.addEventListener(
        "click",
        async () => {

          if (!confirm("Delete this photo?"))
            return;

          const { error } =
            await supabase.storage
              .from("gallery")
              .remove([fileName]);

          if (error) {

            console.error(error);
            return;

          }

          card.remove();

        }
      );

      card.appendChild(deleteBtn);

    }

    gallery.appendChild(card);

  }

  // ==========================
  // LOAD GALLERY
  // ==========================

  async function loadGallery() {

    gallery.innerHTML = "";

    const { data, error } =
      await supabase.storage
        .from("gallery")
        .list();

    if (error) {

      console.error(error);
      return;

    }

    data.reverse();

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

  // ==========================
  // OPEN FILE PICKER
  // ==========================

  if (uploadBtn) {

    uploadBtn.addEventListener(
      "click",
      () => {

        imageInput.click();

      }
    );

  }

  // ==========================
  // UPLOAD IMAGES
  // ==========================

  if (imageInput) {

    imageInput.addEventListener(
      "change",
      async () => {

        uploadBtn.textContent =
          "Uploading...";

        try {

          const files =
            imageInput.files;

          for (const file of files) {

            const fileName =
              Date.now() +
              "-" +
              file.name;

            const { error } =
              await supabase.storage
                .from("gallery")
                .upload(
                  fileName,
                  file
                );

            if (error) {

              throw error;

            }

          }

          await loadGallery();

        } catch (err) {

          console.error(err);

          alert(
            "Upload failed."
          );

        } finally {

          uploadBtn.textContent =
            "Upload Photos";

          imageInput.value = "";

        }

      }
    );

  }

  loadGallery();

}
