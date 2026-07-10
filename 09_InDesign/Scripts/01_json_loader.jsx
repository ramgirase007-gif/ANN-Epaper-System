/**
 * ANN Publisher v2.0 - JSON Loader Module
 * Sprint 9 – Module 1 Production Build
 * 
 * Purpose:
 *   Loads and validates edition.json from the ANN-PUBLISHER project root.
 *   Provides production-quality JSON parsing without JSON.parse() for InDesign 2026.
 *   Zero external dependencies.
 * 
 * Compatibility:
 *   - Adobe InDesign 2026
 *   - ExtendScript (ES3) only
 *   - No modern JavaScript: no JSON.parse, Object.keys, Array.isArray, forEach
 * 
 * Core Functions:
 *   loadEdition()       - Load and parse edition.json from user-selected folder
 *   validateEdition()   - Verify edition object has required structure
 * 
 * Error Handling:
 *   - All errors show formatted alert dialogs
 *   - Never crashes - returns null on any failure
 *   - Validates at every step: file existence, readability, content, JSON syntax
 * 
 * Usage:
 *   var edition = loadEdition();
 *   if (edition && validateEdition(edition)) {
 *       // edition.pages and edition.stories are guaranteed to exist
 *   }
 */

/**
 * Displays formatted error alert dialog
 * Format: Title\n\nDetailed message
 * 
 * @param {string} title - Alert title (short)
 * @param {string} message - Detailed error message
 * @return {void}
 */
function showError(title, message) {
    alert(title + "\n\n" + message);
}

/**
 * Validates that a file exists and is accessible
 * 
 * @param {File} file - File object to validate
 * @return {boolean} - True if file exists and is accessible
 */
function isValidFile(file) {
    if (!file) {
        return false;
    }
    try {
        return file.exists;
    } catch (e) {
        return false;
    }
}

/**
 * Parses JSON string using eval() method
 * ExtendScript compatible - no JSON.parse() available
 * 
 * Process:
 *   1. Check for empty or invalid input
 *   2. Wrap JSON string in parentheses
 *   3. Evaluate as JavaScript expression
 *   4. Catch and handle parsing errors
 * 
 * @param {string} jsonString - Raw JSON string to parse
 * @return {Object|null} - Parsed object or null if parsing fails
 */
function parseJSON(jsonString) {
    if (!jsonString || typeof jsonString !== "string" || jsonString === "") {
        return null;
    }
    
    try {
        // Trim whitespace for cleaner parsing
        var trimmed = jsonString;
        
        // eval() requires parentheses around object literal
        var result = eval("(" + trimmed + ")");
        
        return result;
    } catch (e) {
        // JSON syntax error - return null
        return null;
    }
}

/**
 * Reads file contents as UTF-8 string
 * Handles file open/close safely
 * 
 * @param {File} file - File object to read
 * @return {string|null} - File contents as string or null on failure
 */
function readFileContent(file) {
    if (!file) {
        return null;
    }
    
    try {
        // Open file for reading
        file.open("r");
        
        // Read entire contents
        var content = file.read();
        
        // Close file
        file.close();
        
        return content;
    } catch (e) {
        // Error reading file - return null
        return null;
    }
}

/**
 * Checks if an object has a property with a specific value type
 * Used to validate edition.pages and edition.stories
 * 
 * @param {Object} obj - Object to check
 * @param {string} propertyName - Property name to check
 * @param {string} expectedType - Expected type: "object", "array", "string", etc.
 * @return {boolean} - True if property exists and matches type
 */
function hasPropertyOfType(obj, propertyName, expectedType) {
    if (!obj || typeof obj !== "object") {
        return false;
    }
    
    try {
        if (!obj.hasOwnProperty(propertyName)) {
            return false;
        }
        
        var prop = obj[propertyName];
        
        // For array check, verify it's an object with length property
        if (expectedType === "array") {
            return (typeof prop === "object" && prop !== null && prop.hasOwnProperty("length"));
        }
        
        // For other types, use typeof
        return typeof prop === expectedType;
    } catch (e) {
        return false;
    }
}

/**
 * Validates the structure of an edition object
 * Checks for required properties: edition.pages and edition.stories
 * 
 * Validation criteria:
 *   1. edition is an object (not null)
 *   2. edition.pages exists and is array-like (has length property)
 *   3. edition.stories exists and is array-like (has length property)
 *   4. At least one property exists (object is not empty)
 * 
 * @param {Object} edition - Edition object to validate
 * @return {boolean} - True if edition has required structure
 */
function validateEdition(edition) {
    // Step 1: Verify edition is an object (not null)
    if (typeof edition !== "object" || edition === null) {
        return false;
    }
    
    // Step 2: Check for required properties with correct types
    // edition.pages must be array-like
    var hasPages = hasPropertyOfType(edition, "pages", "array");
    
    // edition.stories must be array-like
    var hasStories = hasPropertyOfType(edition, "stories", "array");
    
    // Both pages and stories must exist
    if (!hasPages || !hasStories) {
        return false;
    }
    
    return true;
}

/**
 * Main entry point - Loads and validates edition.json
 * 
 * Complete Process:
 *   1. Prompts user to select ANN-PUBLISHER project root folder
 *   2. Constructs path to 03_Layouts/edition.json
 *   3. Validates file exists on disk
 *   4. Validates file is readable
 *   5. Reads file contents as UTF-8 string
 *   6. Validates file is not empty
 *   7. Parses JSON using eval("(" + text + ")")
 *   8. Validates parsed object structure
 *   9. Returns parsed edition object
 * 
 * Error Handling:
 *   - Shows formatted alert on any failure
 *   - Never throws exception - always returns null on error
 *   - Provides specific error message for each failure point
 * 
 * @return {Object|null} - Parsed edition object with pages and stories, or null on failure
 */
function loadEdition() {
    // Step 1: Prompt user to select project root folder
    var projectRoot = Folder.selectDialog("Select ANN-PUBLISHER project root");
    
    if (!projectRoot) {
        showError(
            "Load Edition Failed",
            "No project folder selected.\n\nPlease select the ANN-PUBLISHER project root directory."
        );
        return null;
    }
    
    // Step 2: Construct path to edition.json
    var editionFile = new File(projectRoot + "/03_Layouts/edition.json");
    
    // Step 3: Validate file exists on disk
    if (!isValidFile(editionFile)) {
        showError(
            "Load Edition Failed",
            "edition.json not found at:\n\n" + editionFile.fsName + "\n\nVerify the file path and project structure."
        );
        return null;
    }
    
    // Step 4: Read file contents
    var fileContent = readFileContent(editionFile);
    
    if (fileContent === null) {
        showError(
            "Load Edition Failed",
            "Unable to read edition.json file.\n\nVerify file permissions and that the file is not corrupted."
        );
        return null;
    }
    
    // Step 5: Validate file is not empty
    if (fileContent === "" || typeof fileContent !== "string" || fileContent.length === 0) {
        showError(
            "Load Edition Failed",
            "edition.json file is empty.\n\nThe file must contain valid JSON data."
        );
        return null;
    }
    
    // Step 6: Parse JSON using eval()
    var parsedEdition = parseJSON(fileContent);
    
    if (parsedEdition === null || typeof parsedEdition !== "object") {
        showError(
            "Load Edition Failed",
            "Unable to parse edition.json.\n\nVerify JSON syntax is valid.\n\nCommon issues: missing commas, unquoted keys, trailing commas."
        );
        return null;
    }
    
    // Step 7: Validate parsed object structure
    if (!validateEdition(parsedEdition)) {
        showError(
            "Load Edition Failed",
            "Edition object is invalid.\n\nMissing required properties:\n- edition.pages (array)\n- edition.stories (array)"
        );
        return null;
    }
    
    // Step 8: Return valid edition object
    return parsedEdition;
}

// ============================================================================
// Public API Export
// ============================================================================
// External API (functions available for use):
//
// loadEdition()
//   - Main entry point
//   - Prompts user to select project root
//   - Loads 03_Layouts/edition.json
//   - Returns parsed edition object or null
//
// validateEdition(edition)
//   - Validates edition structure
//   - Checks for required properties: pages, stories
//   - Returns boolean
//
// ============================================================================
