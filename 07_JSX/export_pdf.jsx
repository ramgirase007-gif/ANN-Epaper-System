/**
 * ANN Publisher v1.0 - PDF Export Engine
 * High Quality Print Settings
 * 
 * Settings:
 * - Resolution: 300 DPI
 * - Color Space: CMYK
 * - Output Folder: 04_Output/
 */

#target indesign

/**
 * Main PDF export function
 */
function exportPDF() {
    try {
        var doc = app.activeDocument;
        if (!doc) {
            $.writeln("[ERROR] No active InDesign document found");
            return false;
        }
        
        $.writeln("[export_pdf] Starting PDF export");
        $.writeln("[export_pdf] Document: " + doc.name);
        
        // Get output folder path
        var scriptFolder = new File($.fileName).parent;
        var projectRoot = scriptFolder.parent;
        var outputFolder = new Folder(projectRoot + "/04_Output");
        
        // Create output folder if it doesn't exist
        if (!outputFolder.exists) {
            outputFolder.create();
            $.writeln("[export_pdf] Created output folder: " + outputFolder.fsName);
        }
        
        // Generate PDF filename with timestamp
        var timestamp = new Date();
        var year = timestamp.getFullYear();
        var month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
        var day = timestamp.getDate().toString().padStart(2, '0');
        var hours = timestamp.getHours().toString().padStart(2, '0');
        var minutes = timestamp.getMinutes().toString().padStart(2, '0');
        var seconds = timestamp.getSeconds().toString().padStart(2, '0');
        
        var pdfFileName = "ANN_Epaper_" + year + month + day + "_" + hours + minutes + seconds + ".pdf";
        var pdfFile = new File(outputFolder.fsName + "/" + pdfFileName);
        
        $.writeln("[export_pdf] Output file: " + pdfFile.fsName);
        
        // Create high-quality print preset
        var pdfExportPreset = createHighQualityPreset();
        if (!pdfExportPreset) {
            $.writeln("[ERROR] Failed to create PDF export preset");
            return false;
        }
        
        // Export document to PDF
        doc.exportFile(ExportFormat.PDF_TYPE, pdfFile, false, pdfExportPreset);
        
        $.writeln("[export_pdf] PDF exported successfully");
        $.writeln("[export_pdf] File: " + pdfFile.fsName);
        $.writeln("[export_pdf] File size: " + Math.round(pdfFile.length / 1024) + " KB");
        
        // Verify export
        if (pdfFile.exists) {
            $.writeln("[export_pdf] Export verified");
            return true;
        } else {
            $.writeln("[ERROR] PDF file not found after export");
            return false;
        }
        
    } catch (e) {
        $.writeln("[ERROR] exportPDF failed: " + e.message + " (line " + e.line + ")");
        return false;
    }
}

/**
 * Create high-quality print PDF preset
 */
function createHighQualityPreset() {
    try {
        var presetName = "ANN_HighQuality_" + new Date().getTime();
        var pdfExportPresets = app.pdfExportPresets;
        
        // Remove existing preset if present
        try {
            var existingPreset = pdfExportPresets.item("ANN_HighQuality");
            if (existingPreset.isValid) {
                existingPreset.remove();
            }
        } catch (e) {
            // Preset doesn't exist, continue
        }
        
        // Create new preset
        var preset = pdfExportPresets.add(presetName);
        
        $.writeln("[export_pdf] Created preset: " + presetName);
        
        // ========== GENERAL SETTINGS ==========
        preset.pageRange = "";  // All pages
        preset.exportReaderSpreads = false;
        preset.generateThumbnails = true;
        
        // ========== COMPRESSION SETTINGS ==========
        preset.compressionLevel = 6;  // Maximum compression
        preset.compressStructure = true;
        
        // ========== COLOR SETTINGS ==========
        // Convert to CMYK for print
        preset.colorConversionStyle = ColorConversionStyleOptions.CONVERT_TO_DESTINATION;
        preset.colorOutputMode = ColorModel.CMYK;
        preset.pdfColorSpace = PDFColorSpace.CMYK;
        preset.includeICC = true;
        
        // ========== SAMPLING SETTINGS ==========
        // 300 DPI resolution for high-quality print
        preset.rasterResolution = 300;
        preset.samplingMethod = PDFSamplingMethod.SUBSAMPLING;
        preset.subsamplingMethod = 0;  // Average downsampling
        
        // ========== SECURITY SETTINGS ==========
        preset.pdfDisplayTitle = true;
        
        // ========== COMPATIBILITY ==========
        preset.pdfCompatibility = PDFCompatibility.PDF_1_7;
        
        // ========== ADVANCED SETTINGS ==========
        preset.transparencyFlatenerPreset = "[High Resolution]";
        preset.includeSlugWithPDF = false;
        preset.includeBookmarks = true;
        preset.includeHyperlinks = true;
        preset.createAbcdPdf = false;
        
        $.writeln("[export_pdf] Preset configured:");
        $.writeln("  - Resolution: 300 DPI");
        $.writeln("  - Color Space: CMYK");
        $.writeln("  - Compression: Level 6");
        $.writeln("  - Compatibility: PDF 1.7");
        
        return preset;
        
    } catch (e) {
        $.writeln("[ERROR] createHighQualityPreset failed: " + e.message);
        return null;
    }
}

/**
 * Alternative function: Export PDF with specific settings
 */
function exportPDFWithSettings(docReference, outputPath, dpi, colorMode) {
    try {
        var doc = docReference || app.activeDocument;
        if (!doc) {
            $.writeln("[ERROR] No document provided");
            return false;
        }
        
        var outFile = new File(outputPath);
        var preset = createHighQualityPreset();
        
        if (!preset) {
            return false;
        }
        
        // Override DPI if specified
        if (dpi && dpi > 0) {
            preset.rasterResolution = dpi;
            $.writeln("[export_pdf] Set DPI to: " + dpi);
        }
        
        // Export
        doc.exportFile(ExportFormat.PDF_TYPE, outFile, false, preset);
        
        $.writeln("[export_pdf] PDF exported to: " + outFile.fsName);
        return outFile.exists;
        
    } catch (e) {
        $.writeln("[ERROR] exportPDFWithSettings failed: " + e.message);
        return false;
    }
}

/**
 * Export current page range to PDF
 */
function exportPageRangeToPDF(startPage, endPage) {
    try {
        var doc = app.activeDocument;
        if (!doc) {
            $.writeln("[ERROR] No active document");
            return false;
        }
        
        var scriptFolder = new File($.fileName).parent;
        var projectRoot = scriptFolder.parent;
        var outputFolder = new Folder(projectRoot + "/04_Output");
        
        if (!outputFolder.exists) {
            outputFolder.create();
        }
        
        var timestamp = new Date().getTime();
        var pdfFileName = "ANN_Pages_" + startPage + "-" + endPage + "_" + timestamp + ".pdf";
        var pdfFile = new File(outputFolder.fsName + "/" + pdfFileName);
        
        var preset = createHighQualityPreset();
        if (!preset) {
            return false;
        }
        
        // Set page range
        preset.pageRange = startPage + "-" + endPage;
        
        doc.exportFile(ExportFormat.PDF_TYPE, pdfFile, false, preset);
        
        $.writeln("[export_pdf] Page range PDF exported: " + pdfFile.fsName);
        return pdfFile.exists;
        
    } catch (e) {
        $.writeln("[ERROR] exportPageRangeToPDF failed: " + e.message);
        return false;
    }
}

/**
 * Get output folder path
 */
function getOutputFolder() {
    try {
        var scriptFolder = new File($.fileName).parent;
        var projectRoot = scriptFolder.parent;
        var outputFolder = new Folder(projectRoot + "/04_Output");
        
        if (!outputFolder.exists) {
            outputFolder.create();
        }
        
        return outputFolder;
        
    } catch (e) {
        $.writeln("[ERROR] getOutputFolder failed: " + e.message);
        return null;
    }
}

// Execute export on script load
if (typeof exportPDF === "function") {
    exportPDF();
}
