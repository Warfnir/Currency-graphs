from django.urls import path
from . import views

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('calculator/', views.CalculatorView.as_view(), name='calculator'),
]