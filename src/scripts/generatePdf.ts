import path from "path";
import fs from "fs";
import * as ejs from "ejs";
import pdf from "html-pdf";

export const generatePdf = async (data: any, fileName: string = "../extras/informe.ejs", orientation: "portrait" | "landscape" | undefined = "portrait") => {
    try {
        const templatePath = path.join(__dirname, fileName);
        const template = fs.readFileSync(templatePath, 'utf-8');
        const html = ejs.render(template, data);

        return new Promise<Buffer>((resolve, reject) => {
            pdf.create(html, {
                format: "A4", border: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" }, orientation
            }).toBuffer((err, buffer) => {
                if (err) {
                    console.error('Error generating PDF:', err);
                    return reject(new Error('PDF generation failed'));
                }
                resolve(buffer);
            });
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('PDF generation failed');
    }
};