(function() {
    let _shadowRoot;
    let _id;
    let _result ;

    let div;
    let widgetName;
    var Ar = [];

    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
      <style>
      </style>      
    `;

    class Excel extends HTMLElement {

        constructor() {
            super();

            _shadowRoot = this.attachShadow({
                mode: "open"
            });
            _shadowRoot.appendChild(tmpl.content.cloneNode(true));

            _id = createGuid();
            
            //_shadowRoot.querySelector("#oView").id = "oView";

            this._export_settings = {};
            this._export_settings.title = "";
            this._export_settings.subtitle = "";
            this._export_settings.icon = "";
            this._export_settings.unit = "";
            this._export_settings.footer = "";

            this.addEventListener("click", event => {
                console.log('click');

            });

            this._firstConnection = 0;            
        }

        connectedCallback() {
            try {
                if (window.commonApp) {
                    let outlineContainer = commonApp.getShell().findElements(true, ele => ele.hasStyleClass && ele.hasStyleClass("sapAppBuildingOutline"))[0]; // sId: "__container0"

                    if (outlineContainer && outlineContainer.getReactProps) {
                        let parseReactState = state => {
                            let components = {};

                            let globalState = state.globalState;
                            let instances = globalState.instances;
                            let app = instances.app["[{\"app\":\"MAIN_APPLICATION\"}]"];
                            let names = app.names;

                            for (let key in names) {
                                let name = names[key];

                                let obj = JSON.parse(key).pop();
                                let type = Object.keys(obj)[0];
                                let id = obj[type];

                                components[id] = {
                                    type: type,
                                    name: name
                                };
                            }

                            for (let componentId in components) {
                                let component = components[componentId];
                            }

                            let metadata = JSON.stringify({
                                components: components,
                                vars: app.globalVars
                            });

                            if (metadata != this.metadata) {
                                this.metadata = metadata;

                                this.dispatchEvent(new CustomEvent("propertiesChanged", {
                                    detail: {
                                        properties: {
                                            metadata: metadata
                                        }
                                    }
                                }));
                            }
                        };

                        let subscribeReactStore = store => {
                            this._subscription = store.subscribe({
                                effect: state => {
                                    parseReactState(state);
                                    return {
                                        result: 1
                                    };
                                }
                            });
                        };

                        let props = outlineContainer.getReactProps();
                        if (props) {
                            subscribeReactStore(props.store);
                        } else {
                            let oldRenderReactComponent = outlineContainer.renderReactComponent;
                            outlineContainer.renderReactComponent = e => {
                                let props = outlineContainer.getReactProps();
                                subscribeReactStore(props.store);

                                oldRenderReactComponent.call(outlineContainer, e);
                            }
                        }
                    }
                }
            } catch (e) {}
        }

        disconnectedCallback() {
            if (this._subscription) { // react store subscription
                this._subscription();
                this._subscription = null;
            }
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            if ("designMode" in changedProperties) {
                this._designMode = changedProperties["designMode"];
            }
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            var that = this;

            let xlsxjs = "http://localhost/SAC/sacexcel/xlsx.js";
            async function LoadLibs() {
                try {
                    await loadScript(xlsxjs, _shadowRoot);
                } catch (e) {
                    console.log(e);
                } finally {
                    loadthis(that, changedProperties);
                }
            }
            LoadLibs();
        }

        _renderExportButton() {
            let components = this.metadata ? JSON.parse(this.metadata)["components"] : {};
        }

        _firePropertiesChanged() {
            this.unit = "";
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        unit: this.unit
                    }
                }
            }));
        }

        // SETTINGS
        get title() {
            return this._export_settings.title;
        }
        set title(value) {
            console.log("setTitle:" + value);
            this._export_settings.title = value;
        }

        get subtitle() {
            return this._export_settings.subtitle;
        }
        set subtitle(value) {
            this._export_settings.subtitle = value;
        }

        get icon() {
            return this._export_settings.icon;
        }
        set icon(value) {
            this._export_settings.icon = value;
        }

        get unit() {
            return this._export_settings.unit;
        }
        set unit(value) {
            value = _result;
            console.log("value: " + value);
            this._export_settings.unit = value;
        }

        get footer() {
            return this._export_settings.footer;
        }
        set footer(value) {
            this._export_settings.footer = value;
        }

        static get observedAttributes() {
            return [
                "title",
                "subtitle",
                "icon",
                "unit",
                "footer",
                "link"
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }

    }
    customElements.define("com-fd-djaja-sap-sac-excel", Excel);

    // UTILS
    function loadthis(that, changedProperties) {
        var that_ = that;

        widgetName = changedProperties.widgetName;
        if(typeof widgetName === "undefined") {
            widgetName = that._export_settings.title.split("|")[0];
        }


        div = document.createElement('div');
        div.slot = "content_" + widgetName;

        if(that._firstConnection === 0) {
            let div0 = document.createElement('div');   
            div0.innerHTML = '<?xml version="1.0"?><script id="oView_' + widgetName + '" name="oView_' + widgetName + '" type="sapui5/xmlview"><mvc:View height="100%" xmlns="sap.m" xmlns:u="sap.ui.unified" xmlns:f="sap.ui.layout.form" xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" controllerName="myView.Template"><f:SimpleForm editable="true"><f:content><Label text="Upload"></Label><VBox><u:FileUploader id="idfileUploader" width="100%" useMultipart="false" sendXHR="true" sameFilenameAllowed="true" buttonText="" fileType="XLSM" placeholder="" style="Emphasized" change="onValidate"></u:FileUploader></VBox></f:content></f:SimpleForm></mvc:View></script>';
            _shadowRoot.appendChild(div0);  

            let div1 = document.createElement('div');  
            div1.innerHTML = '<?xml version="1.0"?><script id="myXMLFragment_' + widgetName + '" type="sapui5/fragment"><core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><SelectDialog title="Partner Number" class="sapUiPopupWithPadding"  items="{' + widgetName + '>/}" search="_handleValueHelpSearch"  confirm="_handleValueHelpClose"  cancel="_handleValueHelpClose"  multiSelect="true" showClearButton="true" rememberSelections="true"><StandardListItem icon="{' + widgetName + '>ProductPicUrl}" iconDensityAware="false" iconInset="false" title="{' + widgetName + '>partner}" description="{' + widgetName + '>partner}" /></SelectDialog></core:FragmentDefinition></script>';
            _shadowRoot.appendChild(div1);

            let div2 = document.createElement('div');            
            div2.innerHTML = '<div id="ui5_content_' + widgetName + '" name="ui5_content_' + widgetName + '"><slot name="content_' + widgetName + '"></slot></div>';
            _shadowRoot.appendChild(div2);   

            that_.appendChild(div);     

            var mapcanvas_divstr = _shadowRoot.getElementById('oView_' + widgetName);
            var mapcanvas_fragment_divstr = _shadowRoot.getElementById('myXMLFragment_' + widgetName);

            Ar.push({
               'id': widgetName,
               'div': mapcanvas_divstr,
               'divf': mapcanvas_fragment_divstr
            });
        }

        that_._renderExportButton();

        sap.ui.getCore().attachInit(function() {
            "use strict";

            //### Controller ###
            sap.ui.define([
                "jquery.sap.global",
                "sap/ui/core/mvc/Controller",
                "sap/ui/model/json/JSONModel",
                "sap/m/MessageToast",
                "sap/ui/core/library",
                "sap/ui/core/Core",
                'sap/ui/model/Filter',
                'sap/m/library',
                'sap/m/MessageBox',
                'sap/ui/unified/DateRange',
                'sap/ui/core/format/DateFormat',
                'sap/ui/model/BindingMode',
                'sap/ui/core/Fragment',
                'sap/m/Token',
                'sap/ui/model/FilterOperator',
                'sap/ui/model/odata/ODataModel',
                'sap/m/BusyDialog'
            ], function(jQuery, Controller, JSONModel, MessageToast, coreLibrary, Core, Filter, mobileLibrary, MessageBox, DateRange, DateFormat, BindingMode, Fragment, Token, FilterOperator, ODataModel, BusyDialog) {
                "use strict";

                var busyDialog = (busyDialog) ? busyDialog : new BusyDialog({});

                return Controller.extend("myView.Template", {

                    onInit: function() {
                        console.log(that._export_settings.title);
                        console.log("widgetName:" + that.widgetName);

                        if(that._firstConnection === 0) {
                            that._firstConnection = 1;
                        }
                    },

                    onValidate: function (e) {
                        var fU = this.getView().byId("idfileUploader");
                        var domRef = fU.getFocusDomRef();
                        var file = domRef.files[0];
                        var this_ = this;

                        this_.wasteTime();

                        var oModel = new JSONModel();
                        oModel.setData({
                            result_final: null
                        });

                        var reader = new FileReader();
                        reader.onload = async function (e) {
                            var strCSV = e.target.result;

                            var workbook = XLSX.read(strCSV, {
                                type: 'binary'
                            });

                            var result_final = [];
                            var result = [];
                            var correctsheet = false;

                            workbook.SheetNames.forEach(function (sheetName) {
                                if (sheetName === "Sheet1") {
                                    correctsheet = true;
                                    var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                                    if (csv.length) {
                                        result.push(csv);
                                    }
                                    result = result.join("[$@~!~@$]")
                                }
                            });

                            if (correctsheet) {
                                var lengthfield = result.split("[$@~!~@$]")[0].split("[#@~!~@#]").length;
                                console.log("lengthfield: " + lengthfield);

                                var total = this_.getView().byId("total");
                                var rec_count = 0;

                                var len = 0;
                                if (lengthfield === 9) {
                                    for (var i = 1; i < result.split("[$@~!~@$]").length; i++) {
                                        if (result.split("[$@~!~@$]")[i].length > 0) {

                                            var rec = result.split("[$@~!~@$]")[i].split("[#@~!~@#]");
                                            if (rec.length > 0) {
                                                len = rec[0].trim().length + rec[1].trim().length + rec[2].trim().length + rec[3].trim().length + rec[4].trim().length + rec[
                                                    5].trim().length + rec[6].trim().length + rec[7].trim().length + rec[8].trim().length;
                                                if (len > 0) {
                                                    rec_count = rec_count + 1;
                                                    result_final.push({
                                                        'ID': i,
                                                        'DATE': rec[0].trim(),
                                                        'COUNTRY_CODE': rec[1].trim(),
                                                        'COMPANY_CODE': rec[2].trim(),
                                                        'TYPE': rec[3].trim(),
                                                        'VALUE_DATE': rec[4].trim(),
                                                        'AMOUNT': rec[5].trim().replace(/[,]/g, ""),
                                                        'CURRENCY': rec[6].trim(),
                                                        'COMMENTS': rec[7].trim().replace(/["'\n\r]/g, ""),
                                                        'LOCK_FLAG': rec[8].trim(),
                                                    });
                                                }
                                            }
                                        }
                                    }

                                    if (result_final.length === 0) {
                                        fU.setValue("");
                                        MessageToast.show("There is no record to be uploaded");
                                        this_.runNext();
                                    } else if (result_final.length >= 2001) {
                                        fU.setValue("");
                                        MessageToast.show("Maximum records are 2000.");
                                        this_.runNext();
                                    } else {
                                        // Bind the data to the Table
                                        oModel = new JSONModel();
                                        oModel.setSizeLimit("5000");
                                        oModel.setData({
                                            result_final: result_final
                                        });
                                        
                                        var oModel1 = new sap.ui.model.json.JSONModel();
                                        oModel1.setData({
                                            fname: file.name,
                                        });
                                        console.log(oModel);

                                        var oHeaders =  {
                                            "Authorization": "Basic XXXXXXXX",
                                            "Content-Type": "application/x-www-form-urlencoded"
                                        }

                                        var oModel = new JSONModel();

                                        console.log(result_final);
                                        oModel.loadData("processData.xsjs", JSON.stringify(result_final), true, 'POST', false, true, oHeaders);

                                        oModel.attachRequestCompleted(function() {
                                            var result = oModel.getData();
                                            console.log(result);

                                            _result = result;

                                            that._firePropertiesChanged();
                                            this.settings = {};
                                            this.settings.result = "";

                                            that.dispatchEvent(new CustomEvent("onStart", {
                                                detail: {
                                                    settings: this.settings
                                                }
                                            }));

                                            this_.runNext();

                                        });


                                        fU.setValue("");
                                    }
                                } else {
                                    this_.runNext();
                                    fU.setValue("");
                                    MessageToast.show("Please upload the correct file");
                                }
                            } else {
                                this_.runNext();
                                console.log("Error: wrong Excel File template");
                                MessageToast.show("Please upload the correct file");
                            }
                        };

                        if (typeof file !== 'undefined') {
                            reader.readAsBinaryString(file);
                        }
                    },

                    wasteTime: function() {
                        busyDialog.open();
                    },

                    runNext: function() {
                        busyDialog.close();
                    },

                });
            });

            console.log("widgetName Final:" + widgetName);
            var foundIndex = Ar.findIndex(x => x.id == widgetName);
            var divfinal = Ar[foundIndex].div;
            console.log(divfinal);

            //### THE APP: place the XMLView somewhere into DOM ###
            var oView = sap.ui.xmlview({
                viewContent: jQuery(divfinal).html(),
            });

            oView.placeAt(div);
            if (that_._designMode) {
                oView.byId("idfileUploader").setEnabled(false);
            }
        });
    }

    function createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function loadScript(src, shadowRoot) {
        return new Promise(function(resolve, reject) {
            let script = document.createElement('script');
            script.src = src;

            script.onload = () => {
                console.log("Load: " + src);
                resolve(script);
            }
            script.onerror = () => reject(new Error(`Script load error for ${src}`));

            shadowRoot.appendChild(script)
        });
    }
})();
