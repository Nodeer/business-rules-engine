///<reference path='util.ts'/>
///<reference path='error.ts'/>
///<reference path='errorInfo.ts'/>
///<reference path='rules.ts'/>

module Validation {


    /**
     * This represents validation rule.
     */
    export interface IMetaRule {
        Method: string;
        Parameters?: any;
    }


    /**
     * YUIDoc_comment
     *
     * @class rules
     * @constructor
     **/
    export class MetaDataRules {

        public CLASS_NAME:string = 'MetaDataRules';

        public Rules: { [index: string]: MetaDataRule; } = {};

        constructor(public Data:any, public MetaData:any) {
            for (var key in this.MetaData) {
                var metaData = this.MetaData[key];
                if (metaData[Util.RULE_PROPERTY_NAME] != null) {
                    this.Rules[key] = new MetaDataRule(metaData,new ValidationContext(key,this.Data))
                }
            }
        }

        public ValidateAll():void {
            for (var key in this.Rules)
            {
                this.Rules[key].Validate();
            }
        }
    }

    /**
     * Defines a rule associated with a property which can have multiple validators
     */
    export class MetaDataRule{

        public Rule: PropertyValidationRule<any>;

        public get MetaErrors() { return this.Rule.ValidationFailures;}

        public get Error():IErrorInfo {return this.Rule;}

        constructor(metaData: any, public Context:IValidationContext<any>) {

            //read label from metadata
            var label = metaData[Util.LABEL_PROPERTY_NAME];
            var name = label != undefined ? label : this.Context.Key;

            var validators:Array<IPropertyValidator> = [];
            for (var method in metaData.rules) {
                //create validators
                var validator = this.CreateValidator({Method: method, Parameters: metaData.rules[method]});
                validators.push(validator);
            }

            this.Rule = new PropertyValidationRule(name,validators);



            //this.Error.Optional = this.Context.Optional;

        }

        private CreateValidator(rule:IMetaRule):IPropertyValidator{

            switch (rule.Method) {
                case "required":
                    return new RequiredValidator();
                case "minlength":
                    var validator = new MinLengthValidator();
                    validator.MinLength = rule.Parameters;
                    return validator;
                case "maxlength":
                    var maxLengthValidator = new MaxLengthValidator();
                    maxLengthValidator.MaxLength = rule.Parameters;
                    return maxLengthValidator;
            }
        }

        public Validate(): void {
            this.Rule.Validate(this.Context);
        }
        public ClearErrors(): void{
            for (var key in this.MetaErrors) {
                var target = this.MetaErrors[key];
                target.Error.ErrorMessage = "";
                target.Error.HasError = false;
            }
        }
    }

    /**
     *  It represents composition of error objects for rules defined with meta data.
     */
    export class MetaRulesErrorInfo extends CompositeErrorInfo implements IErrorInfo {

        constructor(public Name: string,public MetaRules:any) {

            super(Name);

            _.each(this.MetaRules.Rules, function(rule:any) {
                this.Add(rule.Error);
            },this);
        }

    }
}