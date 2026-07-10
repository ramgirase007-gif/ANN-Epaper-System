/**
 * ANN Publisher v1.0 - JSON Loader Module
 * Sprint 9 – Module 1
 * 
 * Purpose:
 *   Loads and validates edition.json from the ANN-PUBLISHER project root.
 *   Provides production-quality JSON parsing without JSON.parse() for InDesign 2026.
 * 
 * Compatibility:
 *   - Adobe InDesign 2026
 *   - ExtendScript (ES3)
 *   - No modern JavaScript features
 * 
 * Usage:
 *   var edition = loadEdition();
 *   if (edition && validateEdition(edition)) {
 *       // Process edition data
 *   }
 */

/**
 * Displays an error alert dialog with formatted message
 * 
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @return {void}
 */
function showError(title, message) {
    alert(title + "\n\n" + message);
}

/**
 * Validates that a file exists and is readable
 * 
 * @param {File} file - File object to validate
 * @return {boolean} - True if file exists and is readable
 */
function isValidFile(file) {
    if (!file) {
        return false;
    }
    return file.exists;
}

/**
 * Parses JSON string using eval() method (ExtendScript compatible)
 * 
 * @param {string} jsonString - Raw JSON string to parse
 * @return {Object|null} - Parsed object or null if parsing fails
 */
function parseJSON(jsonString) {
    if (!jsonString || jsonString === "") {
        return null;
    }
    
    try {
        var result = eval("(" + jsonString + ")");
        return result;
    } catch (e) {
        return null;
    }
}

/**
 * Reads file contents as string
 * 
 * @param {File} file - File to read
 * @return {string|null} - File contents or null on failure
 */
function readFileContent(file) {
    try {
        file.open("r");
        var content = file.read();
        file.close();
        return content;
    } catch (e) {
        return null;
    }
}

/**
 * Validates the structure of an edition object
 * Ensures object is not empty and has expected properties
 * 
 * @param {Object} edition - Edition object to validate
 * @return {boolean} - True if edition object is valid
 */
function validateEdition(edition) {
    // Verify edition is an object
    if (typeof edition !== "object" || edition === null) {
        return false;
    }
    
    // Verify edition is not empty by checking for any property
    var hasProperties = false;
    for (var key in edition) {
        if (edition.hasOwnProperty(key)) {
            hasProperties = true;
            break;
        }
    }
    
    if (!hasProperties) {
        return false;
    }
    
    return true;
}

/**
 * Loads edition.json from ANN-PUBLISHER project root
 * 
 * Process:
 *   1. Prompts user to select project root via Folder.selectDialog()
 *   2. Navigates to 03_Layouts/edition.json
 *   3. Validates file existence and readability
 *   4. Reads file contents
 *   5. Validates JSON is not empty
 *   6. Parses JSON using eval()
 *   7. Validates parsed object structure
 *   8. Returns parsed edition object or null on failure
 * 
 * @return {Object|null} - Parsed edition object or null if load/validation fails
 */
function loadEdition() {
    // Step 1: Prompt user to select project root
    var projectRoot = Folder.selectDialog("Select ANN-PUBLISHER project root");
    
    if (!projectRoot) {
        showError("Load Edition Failed", "No project folder selected.");
        return null;
    }
    
    // Step 2: Navigate to edition.json file
    var editionFile = new File(projectRoot + "/03_Layouts/edition.json");
    
    // Step 3: Validate file exists
    if (!isValidFile(editionFile)) {
        showError(
            "Load Edition Failed",
            "edition.json not found at:\n" + editionFile.fsName
        );
        return null;
    }
    
    // Step 4: Read file contents
    var fileContent = readFileContent(editionFile);
    
    if (fileContent === null) {
        showError(
            "Load Edition Failed",
            "Unable to read edition.json file."
        );
        return null;
    }
    
    // Step 5: Validate JSON is not empty
    if (fileContent === "" || fileContent.length === 0) {
        showError(
            "Load Edition Failed",
            "edition.json file is empty."
        );
        return null;
    }
    
    // Step 6: Parse JSON using eval()
    var parsedEdition = parseJSON(fileContent);
    
    if (parsedEdition === null) {
        showError(
            "Load Edition Failed",
            "Unable to parse edition.json. Verify JSON syntax."
        );
        return null;
    }
    
    // Step 7: Validate parsed object
    if (!validateEdition(parsedEdition)) {
        showError(
            "Load Edition Failed",
            "Parsed edition object is invalid or empty."
        );
        return null;
    }
    
    // Step 8: Return valid edition object
    return parsedEdition;
}

// ============================================================================
// Public API Export
// ============================================================================
// The following functions are available for external use:
// 
// loadEdition()       - Main entry point, loads and validates edition.json
// validateEdition()   - Validates edition object structure
// ============================================================================
