const now = new Date();
now.setSeconds(0, 0);
DateTime.valueAsNumber = (now.getTime() - now.getTimezoneOffset() * 60000);