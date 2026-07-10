/**
 * ANN Publisher v1.0 - Frame Scanner Module
 * Sprint 9 – Module 2
 * 
 * Purpose:
 *   Scans all pages and page items in an active InDesign document.
 *   Detects TextFrame, Rectangle, and Graphic objects.
 *   Reads script labels and builds a comprehensive FrameMap.
 *   Provides query functions to locate frames by label or prefix.
 * 
 * Compatibility:
 *   - Adobe InDesign 2026
 *   - ExtendScript (ES3)
 *   - No modern JavaScript features
 * 
 * Core Data Structure:
 *   FrameMap array contains objects with properties:
 *   - label (string) - Script label from page item
 *   - page (number) - Page number (1-indexed)
 *   - bounds (array) - [y1, x1, y2, x2] in points
 *   - type (string) - "TextFrame", "Rectangle", or "Graphic"
 *   - id (number) - Unique identifier for the frame
 * 
 * Usage:
 *   var frameMap = scanFrames();
 *   var logoFrame = findFrame("logo");
 *   var headerFrames = findFrames("header_");
 */

/**
 * Global FrameMap storage
 * Initialized by scanFrames() function
 * Array of frame objects with label, page, bounds, type, id
 */
var g_FrameMap = [];

/**
 * Counter for generating unique frame IDs
 * Incremented for each frame detected during scan
 */
var g_FrameCounter = 0;

/**
 * Validates that a document is open and accessible
 * 
 * @return {boolean} - True if valid document exists
 */
function isDocumentOpen() {
    try {
        if (app.documents.length === 0) {
            return false;
        }
        var doc = app.activeDocument;
        if (!doc) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Retrieves the active document safely
 * 
 * @return {Document|null} - Active document or null if not available
 */
function getActiveDocument() {
    try {
        return app.activeDocument;
    } catch (e) {
        return null;
    }
}

/**
 * Converts page item bounds array to string representation
 * Bounds format: [y1, x1, y2, x2] in points
 * 
 * @param {array} bounds - Bounds array [y1, x1, y2, x2]
 * @return {string} - Formatted bounds string
 */
function formatBounds(bounds) {
    if (!bounds || bounds.length !== 4) {
        return "[0, 0, 0, 0]";
    }
    return "[" + bounds[0] + ", " + bounds[1] + ", " + bounds[2] + ", " + bounds[3] + "]";
}

/**
 * Determines the type of a page item
 * Detects TextFrame, Rectangle, or Graphic
 * 
 * @param {PageItem} pageItem - Page item to examine
 * @return {string} - Type identifier: "TextFrame", "Rectangle", "Graphic", or "Unknown"
 */
function getPageItemType(pageItem) {
    if (!pageItem) {
        return "Unknown";
    }
    
    try {
        // Check for TextFrame
        if (pageItem.constructor.name === "TextFrame") {
            return "TextFrame";
        }
        
        // Check for Rectangle (a regular shape)
        if (pageItem.constructor.name === "Rectangle") {
            return "Rectangle";
        }
        
        // Check for Graphic (images, placed files)
        if (pageItem.constructor.name === "Graphic") {
            return "Graphic";
        }
        
        // Fallback: check itemLayer property
        if (pageItem.hasOwnProperty("itemLayer")) {
            if (pageItem.itemLayer.name === "TextFrame") {
                return "TextFrame";
            }
        }
        
        return "Unknown";
    } catch (e) {
        return "Unknown";
    }
}

/**
 * Reads the script label from a page item
 * Script labels are stored in page item's label property
 * 
 * @param {PageItem} pageItem - Page item to read label from
 * @return {string} - Script label, or empty string if not set
 */
function readScriptLabel(pageItem) {
    if (!pageItem) {
        return "";
    }
    
    try {
        if (pageItem.hasOwnProperty("label") && pageItem.label) {
            return String(pageItem.label);
        }
    } catch (e) {
        // Label property not accessible
    }
    
    return "";
}

/**
 * Extracts bounds from a page item
 * Returns bounds in format [y1, x1, y2, x2]
 * 
 * @param {PageItem} pageItem - Page item to extract bounds from
 * @return {array} - Bounds array [y1, x1, y2, x2]
 */
function extractBounds(pageItem) {
    if (!pageItem || !pageItem.hasOwnProperty("geometricBounds")) {
        return [0, 0, 0, 0];
    }
    
    try {
        var bounds = pageItem.geometricBounds;
        if (bounds && bounds.length === 4) {
            return [bounds[0], bounds[1], bounds[2], bounds[3]];
        }
    } catch (e) {
        // Bounds not accessible
    }
    
    return [0, 0, 0, 0];
}

/**
 * Processes a single page item
 * Creates frame entry if item type matches detection criteria
 * Adds entry to global g_FrameMap array
 * 
 * @param {PageItem} pageItem - Page item to process
 * @param {number} pageNumber - Page number (1-indexed)
 * @return {void}
 */
function processPageItem(pageItem, pageNumber) {
    if (!pageItem) {
        return;
    }
    
    // Detect item type
    var itemType = getPageItemType(pageItem);
    
    // Only process recognized types
    if (itemType === "Unknown") {
        return;
    }
    
    // Read script label
    var label = readScriptLabel(pageItem);
    
    // Extract bounds
    var bounds = extractBounds(pageItem);
    
    // Create frame entry
    var frameEntry = {
        label: label,
        page: pageNumber,
        bounds: bounds,
        type: itemType,
        id: g_FrameCounter
    };
    
    // Increment counter for next frame
    g_FrameCounter = g_FrameCounter + 1;
    
    // Add to FrameMap
    g_FrameMap.push(frameEntry);
}

/**
 * Processes all page items on a single page
 * Iterates through all items and calls processPageItem()
 * Handles nested items in groups
 * 
 * @param {Page} page - Page object to scan
 * @param {number} pageNumber - Page number (1-indexed)
 * @return {void}
 */
function processPage(page, pageNumber) {
    if (!page || !page.hasOwnProperty("pageItems")) {
        return;
    }
    
    try {
        var pageItems = page.pageItems;
        
        if (!pageItems) {
            return;
        }
        
        // Iterate through all page items
        for (var i = 0; i < pageItems.length; i++) {
            var pageItem = pageItems[i];
            processPageItem(pageItem, pageNumber);
        }
    } catch (e) {
        // Error processing page items
    }
}

/**
 * Scans all pages in the active document
 * Builds comprehensive FrameMap with all detected frames
 * Resets global FrameMap before scanning
 * 
 * Process:
 *   1. Validates document is open
 *   2. Resets FrameMap and counter
 *   3. Iterates through all pages
 *   4. For each page, processes all page items
 *   5. Returns complete FrameMap array
 * 
 * @return {array} - FrameMap array with all detected frames
 */
function scanFrames() {
    // Step 1: Validate document
    if (!isDocumentOpen()) {
        alert("Frame Scanner\n\nError: No active document open.");
        return [];
    }
    
    var doc = getActiveDocument();
    if (!doc) {
        alert("Frame Scanner\n\nError: Cannot access active document.");
        return [];
    }
    
    // Step 2: Reset global state
    g_FrameMap = [];
    g_FrameCounter = 0;
    
    // Step 3: Validate pages exist
    if (!doc.hasOwnProperty("pages") || doc.pages.length === 0) {
        alert("Frame Scanner\n\nError: Document contains no pages.");
        return [];
    }
    
    // Step 4: Iterate through pages
    var pageCount = doc.pages.length;
    
    for (var pageIdx = 0; pageIdx < pageCount; pageIdx++) {
        var page = doc.pages[pageIdx];
        var pageNumber = pageIdx + 1;  // Convert to 1-indexed page number
        
        // Process all items on this page
        processPage(page, pageNumber);
    }
    
    return g_FrameMap;
}

/**
 * Searches for a frame with exact label match
 * Returns first frame found with matching label
 * 
 * @param {string} label - Exact label to search for
 * @return {Object|null} - Frame object if found, null otherwise
 */
function findFrame(label) {
    if (!label || label === "") {
        return null;
    }
    
    // Ensure FrameMap is populated
    if (g_FrameMap.length === 0) {
        return null;
    }
    
    // Search for matching label
    for (var i = 0; i < g_FrameMap.length; i++) {
        var frame = g_FrameMap[i];
        
        if (frame && frame.hasOwnProperty("label")) {
            if (frame.label === label) {
                return frame;
            }
        }
    }
    
    return null;
}

/**
 * Searches for all frames with label starting with prefix
 * Returns array of all matching frames
 * Useful for finding related frames (e.g., all "header_" prefixed labels)
 * 
 * @param {string} prefix - Label prefix to search for
 * @return {array} - Array of matching frame objects
 */
function findFrames(prefix) {
    if (!prefix || prefix === "") {
        return [];
    }
    
    // Ensure FrameMap is populated
    if (g_FrameMap.length === 0) {
        return [];
    }
    
    var results = [];
    var prefixLength = prefix.length;
    
    // Search for labels starting with prefix
    for (var i = 0; i < g_FrameMap.length; i++) {
        var frame = g_FrameMap[i];
        
        if (frame && frame.hasOwnProperty("label")) {
            var frameLabel = frame.label;
            
            // Check if label starts with prefix
            if (frameLabel.length >= prefixLength) {
                var labelPrefix = frameLabel.substr(0, prefixLength);
                
                if (labelPrefix === prefix) {
                    results.push(frame);
                }
            }
        }
    }
    
    return results;
}

// ============================================================================
// Public API Export
// ============================================================================
// The following functions are available for external use:
// 
// scanFrames()        - Scans document and builds FrameMap, returns array
// findFrame(label)    - Finds single frame by exact label match
// findFrames(prefix)  - Finds all frames with label starting with prefix
// 
// Internal global state (do not modify directly):
// g_FrameMap          - Current FrameMap array (populated by scanFrames)
// g_FrameCounter      - Frame ID counter
// ============================================================================
