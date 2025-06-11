from django.urls import path
from .views import PollListView, PollCreateView, PollDetailView

urlpatterns = [
    path('get-list/', PollListView.as_view(), name='poll-list'),
    path('create/', PollCreateView.as_view(), name='poll-create'),
    path('<int:poll_id>/', PollDetailView.as_view(), name='poll-detail'),
]
