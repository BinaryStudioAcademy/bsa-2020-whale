using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Whale.API.Helpers
{
	public static class ValidationHelper
	{
		public static Task ValidateProperties<T>(T entity)
		{
			var validationResults = new List<ValidationResult>();
			bool isValid = Validator.TryValidateObject(
				entity,
				new ValidationContext(entity),
				validationResults,
				true);

			if (!isValid)
			{
				string errorMessage = "";
				foreach (var result in validationResults)
				{
					errorMessage += result.ErrorMessage + "\n";
				}
				throw new ArgumentException(errorMessage);
			}

			return Task.CompletedTask;
		}
	}
}
