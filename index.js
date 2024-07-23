// Importa las bibliotecas puppeteer y xlsx
const puppeteer = require('puppeteer');
const xlsx = require('xlsx');

// Función asincrónica autoejecutable
(async () => {

    // URL de la página que se va a abrir
    const URL = 'https://www.24horas.cl/deportes/futbol-nacional/colo-colo/';

    // Lanza una nueva instancia del navegador
    const browser = await puppeteer.launch({
        headless: false // Modo no headless para ver las interacciones en el navegador
    });

    // Abre una nueva pestaña en el navegador
    const page = await browser.newPage();
    
    // Navega a la URL especificada y espera hasta que la red esté inactiva
    await page.goto(URL, { waitUntil: 'networkidle2' });

    // Obtiene el título de la página
    const title = await page.title();
    console.log('Titulo de la página: ' + title);

    // Inicializa un array para almacenar todas las noticias
    let noticiasAll = [];
    // Variable para controlar si se debe seguir a la siguiente página
    let nextPage = true;

    // Bucle mientras haya una siguiente página
    while (nextPage) {
        // Ejecuta una función dentro del contexto del navegador para obtener las noticias
        const noticiasNew = await page.evaluate(() => {
            // Selecciona todos los elementos 'article'
            const noticias = Array.from(document.querySelectorAll('article'));
            // Mapea los artículos y retorna un array de objetos con el título y la fecha de cada noticia
            return noticias.map(product => {
                const title = product.querySelector('.tit').innerText;
                const fecha = product.querySelector('.fecha').innerText;
                return { title, fecha };
            });
        });

        // Añade las nuevas noticias al array total de noticias
        noticiasAll = [...noticiasAll, ...noticiasNew];
        
        // Aquí podrías implementar la lógica para navegar a la siguiente página.
        // Actualmente, nextPage se establece en false para detener el bucle.
        nextPage = false;
    }

    // Muestra todas las noticias en la consola
    console.log(noticiasAll);

    // Cierra el navegador
    await browser.close();

    // Crea un nuevo libro de Excel
    const wb = xlsx.utils.book_new();
    // Convierte el array de noticias a una hoja de Excel
    const ws = xlsx.utils.json_to_sheet(noticiasAll);
    // Define la ruta y el nombre del archivo Excel
    const path = 'data/noticias-colo-colo.xlsx';

    // Añade la hoja al libro de Excel con el nombre 'Noticias'
    xlsx.utils.book_append_sheet(wb, ws, 'Noticias');
    // Escribe el archivo Excel en la ruta especificada
    xlsx.writeFile(wb, path);

})();
