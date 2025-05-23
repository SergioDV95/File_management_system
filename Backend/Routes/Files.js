const router = require("express").Router();
const Files = require("../Models/Files");
const { Customer } = require("../Models/Customer");
const fs = require("fs");
const multer = require("multer");
const iconv = require("iconv-lite");

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = "uploads/";
    //clasificación por tipo de archivo
    switch (true) {
      case file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        dir += "excel";
        break;
      case file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        dir += "word";
        break;
      case file.mimetype === "application/pdf":
        dir += "pdf";
        break;
      case file.mimetype.startsWith("image"):
        dir += "images/";
        //clasificación por subtipo de imagen
        if (file.mimetype.endsWith("svg+xml")) {
          dir += "svg";
        } else if (file.mimetype.endsWith("gif")) {
          dir += "gif";
        } else if (file.mimetype.endsWith("avif")) {
          dir += "avif";
        } else if (file.mimetype.endsWith("bmp")) {
          dir += "bmp";
        } else if (file.mimetype.endsWith("icon")) {
          dir += "icon";
        } else if (file.mimetype.endsWith("jpeg")) {
          dir += "jpeg";
        } else if (file.mimetype.endsWith("png")) {
          dir += "png";
        } else if (file.mimetype.endsWith("tiff")) {
          dir += "tiff";
        } else if (file.mimetype.endsWith("webp")) {
          dir += "webp";
        } else {
          dir += "other";
        }
        break;
    }
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const encodedFilename = iconv.encode(file.originalname, "utf8").toString();
    cb(
      null,
      `${Date.now().toString().substring(7)}_${encodedFilename.replace(
        /\s/g,
        "_"
      )}`
    );
  },
});

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 1024 * 1024 * 30,
  },
  fileFilter: (req, file, cb) => {
    const excel =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const word =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const pdf = "application/pdf";
    if (
      file.mimetype === excel ||
      file.mimetype === word ||
      file.mimetype === pdf ||
      file.mimetype.startsWith("image")
    ) {
      cb(null, true);
    } else {
      //si el archivo no es excel, word, pdf o imagen, lo rechaza y lanza error
      cb(new Error("Tipo de archivo no permitido"), false);
    }
  },
});

router.get("/", async (req, res) => {
  try {
    const customer_id = req.query.customer_id; // Obtener el customer_id desde la query
    if (!customer_id) {
      return res.status(400).json({ message: "customer_id is required" });
    }

    const customer = await Customer.findOne({ customer_id: customer_id });

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 8,
    };

    const filter = {};

    const files = await Files.paginate(
      {
        customer_id: customer._id,
        ...filter,
      },
      options
    );

    if (!files) {
      return res.status(404).json({ message: "No se encontraron archivos" });
    }

    return res.status(200).json(files);
  } catch (error) {
    return res.status(405).json({ name: error.name, message: error.message });
  }
});

router.post("/", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.body.customer_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const customer_id = req.body.customer_id;

    const customer = await Customer.findOne({ customer_id: customer_id });
    for (const file of req.files) {
      const uploadedFile = {
        name: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        encoding: file.encoding,
        customer_id: customer._id,
      };
      const newFile = new Files({ ...uploadedFile });
      await newFile.save();
    }
    return res.status(200).send("Archivos cargados con éxito");
  } catch (error) {
    return res.status(405).json({ name: error.name, message: error.message });
  }
});

router.patch("/:id", upload.single("file"), async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const file = await Files.findById({
      _id: req.query._id,
    });
    if (!file) {
      return res.status(404).send("Archivo no encontrado");
    }
    fs.unlink(file.path, (err) => {
      if (err) res.status(500).send("Error al borrar el archivo");
      else {
        console.log("Archivo borrado");
      }
    });
    const uploadedFile = {
      name: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      encoding: req.file.encoding,
    };
    Object.assign(file, uploadedFile);
    await file.save();
    return res.status(200).send("Archivo actualizado con éxito");
  } catch (error) {
    return res.status(405).json({ name: error.name, message: error.message });
  }
});

router.delete("/:_id", async (req, res) => {
  try {
    if (!req.params._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const _id = req.params._id;
    const file = await Files.findById({
      _id: _id,
    });
    if (!file) {
      return res.status(404).send("Archivo no encontrado");
    }
    fs.unlink(file.path, (err) => {
      if (err) res.status(500).send("Error al borrar el archivo");
      else {
        console.log("Archivo borrado");
        Files.findByIdAndDelete(id).then(() =>
          res.status(200).send("Archivo eliminado con éxito")
        );
      }
    });
  } catch (error) {
    return res.status(405).json({ name: error.name, message: error.message });
  }
});

module.exports = router;
