<template>
    <div class="pdf-form-card">
        <div class="create-pdf-report">
            <h2>Create PDF Report</h2>
            <form @submit.prevent="handleGenerateReport" class="report-form">
                <fieldset>
                    <legend>Filter Criteria</legend>

                    <div class="filter-block">
                        <label>
                            <input type="checkbox" v-model="enabledFilters.itemType" />
                            Filter by Item Type
                        </label>

                        <div v-if="enabledFilters.itemType" class="checkbox-group">
                            <label v-for="option in itemTypeOptions" :key="option.value">
                                <input type="checkbox" :value="option.value" v-model="selectedFilters.itemType" />
                                {{ option.label }}
                            </label>
                        </div>
                    </div>

                    <div class="filter-block">
                        <label>
                            <input type="checkbox" v-model="enabledFilters.itemSubType" />
                            Filter by Item SubType
                        </label>

                        <div v-if="enabledFilters.itemSubType" class="checkbox-group checkbox-group-subtype">

                            <!-- ✅ Top Actions Row -->
                            <div class="select-actions-row">
                                <label class="select-all">
                                    <input type="checkbox" :checked="allSubTypesSelected"
                                        :indeterminate="isSubTypeIndeterminate" @change="toggleAllSubTypes" />
                                    <strong>Select All</strong>
                                </label>

                                <button type="button" class="btn-link clear-all-btn"
                                    @click="selectedFilters.itemSubType = []">
                                    Clear All
                                </button>
                            </div>

                            <div class="divider"></div>

                            <!-- ✅ Options BELOW -->
                            <div class="options-grid">
                                <label v-for="option in itemSubTypeOptions" :key="option">
                                    <input type="checkbox" :value="option" v-model="selectedFilters.itemSubType" />
                                    {{ option }}
                                </label>
                            </div>

                        </div>
                    </div>
                    <div class="filter-block">
                        <label>
                            <input type="checkbox" v-model="enabledFilters.itemStatus" />
                            Filter by Item Status
                        </label>

                        <div v-if="enabledFilters.itemStatus" class="checkbox-group">
                            <label v-for="option in itemStatusOptions" :key="option.value">
                                <input type="checkbox" :value="option.value" v-model="selectedFilters.itemStatus" />
                                {{ option.label }}
                            </label>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>Sort Order</legend>

                    <div class="sort-row">
                        <label>
                            1st Sort
                            <select v-model="sortSelections.first">
                                <option value="">ItemNumber (default)</option>
                                <option v-for="option in sortOptions" :key="`first-${option.value}`"
                                    :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </label>

                        <label>
                            2nd Sort
                            <select v-model="sortSelections.second">
                                <option value="">None</option>
                                <option v-for="option in availableSecondSortOptions" :key="`second-${option.value}`"
                                    :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </label>

                        <label>
                            3rd Sort
                            <select v-model="sortSelections.third">
                                <option value="">None</option>
                                <option v-for="option in availableThirdSortOptions" :key="`third-${option.value}`"
                                    :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </label>
                    </div>
                </fieldset>

                <div class="actions">
                    <button type="submit" :disabled="generatingPdf || loadingItems">
                        {{ generatingPdf || loadingItems ? "Generating..." : "Generate PDF Report" }}
                    </button>

                    <button type="button" @click="goBack" :disabled="generatingPdf || loadingItems">
                        Cancel
                    </button>
                </div>
            </form>

            <p v-if="loadingItems">Loading items...</p>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<script>
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import APIService from "@/api/APIService";

export default {
    name: "CreatePDFReport",

    data() {
        return {
            generatingPdf: false,
            loadingItems: false,
            errorMessage: "",
            items: [],

            enabledFilters: {
                itemType: false,
                itemSubType: false,
                itemStatus: false,
            },

            selectedFilters: {
                itemType: [],
                itemSubType: [],
                itemStatus: [],
            },

            itemTypeOptions: [
                { value: "Flowers", label: "Flowers" },
                { value: "Crochet", label: "Crochet" },
            ],

            itemSubTypeOptions: [
                "Animal", "Bundle", "Centerpiece-General", "Christmas", "Door Sign",
                "Easter", "Fall", "General", "Halloween", "Hanging Item",
                "Magnet", "Ornament", "Other", "Patriotic", "Pop Culture",
                "Roses", "Sports", "Spring", "Standing Wood Item", "Summer",
                "Thanksgiving", "Vase", "Winter"
            ],

            itemStatusOptions: [
                { value: "A", label: "Available" },
                { value: "S", label: "Sold" },
                { value: "R", label: "Replace" },
                { value: "K", label: "Kept" },
                { value: "All", label: "All" },
                { value: "D", label: "Display" },
            ],

            sortOptions: [
                { value: "ItemNumber", label: "Item Number" },
                { value: "ItemType", label: "Item Type" },
                { value: "ItemSubType", label: "Item SubType" },
                { value: "ItemStatus", label: "Item Status" },
            ],

            sortSelections: {
                first: "",
                second: "",
                third: "",
            },
            // columns to include in the report and their display labels
            headers: [
                "ItemNumber",
                "ItemType",
                "ItemSubType",
                "ItemStatus",
                "ItemDescription",
                "ItemAskingPrice",
            ],

            headerLabels: {
                ItemNumber: "Item #",
                ItemType: "Type",
                ItemSubType: "SubType",
                ItemStatus: "Status",
                Description: "Description",
                Price: "Price",
            },
        };
    },

    computed: {
        // Generates a dynamic title for the PDF report based on the selected filters
        pdfReportTitle() {
            const parts = ["Item Report"];
            if (this.enabledFilters.itemType && this.selectedFilters.itemType.length) {
                parts.push(`${this.selectedFilters.itemType.join(", ")}`);
            }
            if (this.enabledFilters.itemSubType && this.selectedFilters.itemSubType.length) {
                parts.push(`ItemSubTypes`);
            }
            if (this.enabledFilters.itemStatus && this.selectedFilters.itemStatus.length) {
                const selectedStatusLabels = this.itemStatusOptions
                    .filter((option) => this.selectedFilters.itemStatus.includes(option.value))
                    .map((option) => option.label);
                parts.push(`${selectedStatusLabels.join(", ")}`);
            }
            return parts.join(" | ");
        },
        // Resolves the sort criteria based on user selections, ensuring no duplicates and 
        // a default sort by ItemNumber
        resolvedSortCriteria() {
            const sorts = [];
            const seen = new Set();

            const selections = [
                this.sortSelections.first || "ItemNumber",
                this.sortSelections.second,
                this.sortSelections.third,
            ];

            selections.forEach((field) => {
                if (field && !seen.has(field)) {
                    sorts.push({ column: field, ascending: true });
                    seen.add(field);
                }
            });

            if (!seen.has("ItemNumber")) {
                sorts.push({ column: "ItemNumber", ascending: true });
            }

            return sorts;
        },
        // Computes the available options for the second sort dropdown, excluding the first selection
        availableSecondSortOptions() {
            return this.sortOptions.filter(
                (option) => option.value !== (this.sortSelections.first || "ItemNumber")
            );
        },
        // Computes the available options for the third sort dropdown, excluding the first and second selections
        availableThirdSortOptions() {
            return this.sortOptions.filter(
                (option) =>
                    option.value !== (this.sortSelections.first || "ItemNumber") &&
                    option.value !== this.sortSelections.second
            );
        },
        // Determines if all item subtypes are selected for the "Select All" checkbox state
        allSubTypesSelected() {
            return (
                this.itemSubTypeOptions.length > 0 &&
                this.selectedFilters.itemSubType.length === this.itemSubTypeOptions.length
            );
        },
        // Determines if the "Select All" checkbox should be in an indeterminate state (some but not all subtypes selected)
        isSubTypeIndeterminate() {
            return (
                this.selectedFilters.itemSubType.length > 0 &&
                this.selectedFilters.itemSubType.length < this.itemSubTypeOptions.length
            );
        },
    },

    methods: {
        goBack() {
            this.$router.back();
        },
        // Builds the filter criteria array based on the enabled filters and selected values,
        // which will be sent to the API to retrieve the relevant items for the report
        buildFilterCriteria() {
            const filters = [];

            if (this.enabledFilters.itemType && this.selectedFilters.itemType.length > 0) {
                filters.push({
                    column: "ItemType",
                    operator: "in",
                    value: this.selectedFilters.itemType,
                });
            }
            if (this.enabledFilters.itemSubType && this.selectedFilters.itemSubType.length > 0) {
                filters.push({
                    column: "ItemSubType",
                    operator: "in",
                    value: this.selectedFilters.itemSubType,
                });
            }
            if (this.enabledFilters.itemStatus && this.selectedFilters.itemStatus.length > 0) {
                const includeAll = this.selectedFilters.itemStatus.includes("All");
                if (!includeAll) {
                    filters.push({
                        column: "ItemStatus",
                        operator: "in",
                        value: this.selectedFilters.itemStatus,
                    });
                }
            }
            return filters;
        },
        // Toggles the selection of all item subtypes when the "Select All" checkbox is changed
        toggleAllSubTypes(event) {
            if (event.target.checked) {
                this.selectedFilters.itemSubType = [...this.itemSubTypeOptions];
            } else {
                this.selectedFilters.itemSubType = [];
            }
        },
        // Loads the items from the API based on the constructed filter criteria and sort criteria,
        async loadItemsForReport() {
            this.loadingItems = true;
            this.errorMessage = "";
            try {
                const filterCriteria = this.buildFilterCriteria();
                const sortCriteria = this.resolvedSortCriteria;

                const data = await APIService.getItemsSortCriteria(sortCriteria, filterCriteria);
                this.items = Array.isArray(data) ? data : [];
                if (!this.items.length) {
                    window.alert("No items matched the selected report criteria.");
                    return false;
                }
                return true;
            } catch (error) {
                console.error("Error loading report items:", error);
                this.errorMessage = "There was an error loading items for the report.";
                return false;
            } finally {
                this.loadingItems = false;
            }
        },
        // Formats a cell value for inclusion in the PDF report, applying specific 
        // formatting for currency and boolean values
        formatPdfCellValue(header, item) {
            const value = item[header];
            if (["ItemAskingPrice", "ItemCost"].includes(header)) {
                return this.formatCurrency(value);
            }
            if (typeof value === "boolean") {
                return value ? "Yes" : "No";
            }
            return value ?? "";
        },
        // Formats a numeric value as currency, returning an empty string for null or empty values
        formatCurrency(value) {
            if (value == null || value === "") return "";
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(value);
        },
        // Handles the generation of the PDF report by first loading the relevant items based on 
        // the selected filters and then generating the PDF if items are found
        async handleGenerateReport() {
            const hasData = await this.loadItemsForReport();
            if (!hasData) return;

            await this.generatePdfReport();
        },
        // Generates the PDF report using the loaded items, applying the selected filters and sort criteria, 
        // and then triggers a download of the generated PDF
        async generatePdfReport() {
            if (!this.items.length) {
                window.alert("There are no items to include in the report.");
                return;
            }
            this.generatingPdf = true;
            try {
                const doc = new jsPDF({
                    orientation: "portrait",
                    unit: "pt",
                    format: "letter",
                });
                const exportHeaders = this.headers.filter((header) => header !== "ItemImage");
                const tableHead = [
                    exportHeaders.map((header) => this.headerLabels[header] || header),
                ];
                const tableBody = this.items.map((item) =>
                    exportHeaders.map((header) => this.formatPdfCellValue(header, item))
                );
                const generatedAt = new Intl.DateTimeFormat("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                    hour: "numeric", minute: "2-digit",
                }).format(new Date());
                // Use autoTable to generate the table in the PDF, with custom styling and pagination
                autoTable(doc, {
                    head: tableHead,
                    body: tableBody,
                    startY: 90,
                    margin: {
                        top: 44,
                        right: 30,
                        bottom: 30,
                        left: 30,
                    },
                    theme: "grid",
                    styles: {
                        fontSize: 8,
                        cellPadding: 5,
                        overflow: "linebreak",
                        valign: "middle",
                    },
                    headStyles: {
                        fontStyle: "bold",
                    },
                    rowPageBreak: "auto",
                    // Custom page drawing to add headers and footers on each page
                    willDrawPage: (data) => {
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const pageNumber = data.pageNumber;

                        if (pageNumber === 1) {
                            doc.setFontSize(16);
                            doc.text(this.pdfReportTitle, 40, 40);

                            doc.setFontSize(10);
                            doc.text(`Generated: ${generatedAt}`, 40, 60);
                            doc.text(`Total items: ${this.items.length}`, pageWidth - 30, 60, {
                                align: "right",
                            });
                        } else {
                            doc.setFontSize(10);
                            doc.text(this.pdfReportTitle, 30, 20);

                            doc.setFontSize(8);
                            doc.text(`Generated: ${generatedAt}`, pageWidth - 30, 20, {
                                align: "right",
                            });

                            doc.line(30, 34, pageWidth - 30, 34);
                        }
                    },
                    // Custom page drawing to add page numbers in the footer
                    didDrawPage: (data) => {
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const pageHeight = doc.internal.pageSize.getHeight();

                        doc.setFontSize(9);
                        doc.text(`Page ${data.pageNumber}`, pageWidth - 30, pageHeight - 12, {
                            align: "right",
                        });
                    },
                });
                //
                const safeTitle = (this.pdfReportTitle || "report")
                    .replace(/[\\/:*?"<>|]+/g, "")
                    .replace(/\s+/g, "_");

                doc.save(`${safeTitle}.pdf`);
            } catch (error) {
                console.error("Error generating PDF report:", error);
                window.alert("There was an error generating the PDF report.");
            } finally {
                this.generatingPdf = false;
            }
        },
    },
};
</script>

<style scoped>
.create-pdf-report {
    max-width: 1000px;
    margin: 0 auto;
    padding: 1rem;
}

.report-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.filter-block {
    margin-bottom: 1rem;
}

.checkbox-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.35rem 1rem;
    margin-top: 0.5rem;
    padding-left: 1.25rem;
}

.checkbox-group-subtype {
    display: flex;
    flex-direction: column;
    /* 🔥 forces vertical stacking */
}

.sort-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(180px, 1fr));
    gap: 1rem;
}

.actions {
    display: flex;
    gap: 0.75rem;
}

.error {
    color: #b00020;
}

.pdf-form-card {
    background: #ffffff;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    max-width: 1100px;
    margin: 0 auto;
}

.select-actions-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 6px;
}

.select-all {
    display: flex;
    align-items: center;
    gap: 6px;
}

.clear-all-btn {
    font-size: 0.9rem;
    cursor: pointer;
}

.divider {
    width: 100%;
    border-bottom: 1px solid #eee;
    margin: 8px 0;
}

.options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px 20px;
}
</style>