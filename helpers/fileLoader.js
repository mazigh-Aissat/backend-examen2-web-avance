import multer from "multer";
// Stockage de l'image ou du fichier charge

const storage = multer.diskStorage({
    destination: './public/images',
    filename: function (req, file, cb) {
        // cb(null, file.fieldname + '-' + Date.now() +'.'+ file.originalname.split('.')[1]);
        cb(null, file.fieldname + '-' + req.body.nom + '.' + file?.originalname?.split('.')[1]) //Ajouter le nom de l'utilisateur
    }
});

//Filtrer pour n'accepter des fichiers de type image
let fileFilter = function (req, file, cb) {
    const typeAcceptes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (typeAcceptes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

//Charger le fichier en indiquant le lieu de stockage, la taille maximale et le type accepte
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 ** 7 },  // 10MB
    fileFilter: fileFilter
})

export default upload