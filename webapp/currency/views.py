from django.shortcuts import render
from django.views.generic import View
# Create your views here.


class IndexView(View):
    template_name = 'currency/charts.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        pass


class CalculatorView(View):
    template_name = 'currency/calculator.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        pass
