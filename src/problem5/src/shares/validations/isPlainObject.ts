import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsPlainObject(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'isPlainObject',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: {
				validate(value: any) {
					return (
						typeof value === 'object' && value !== null && !Array.isArray(value)
					);
				},
			},
		});
	};
}
